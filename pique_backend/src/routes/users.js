const express = require("express");
const { db, admin } = require("../config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/users — List all users (excluding current user)
// Replaces: getDocs(collection(db, 'users')) in ExplorePage.tsx
// Used for friend markers on the map + friends leaderboard
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs
      .filter((doc) => doc.id !== req.user.uid)
      .map((doc) => ({
        id: doc.id,
        name: doc.data().displayName || "Unknown",
        avatar: doc.data().avatar || null,
        lat: doc.data().lat || 0,
        lng: doc.data().lng || 0,
        points: doc.data().points || 0,
      }));

    return res.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/me — Get current user's own profile
// Useful for profile page, settings, etc.
// ---------------------------------------------------------------------------
router.get("/me", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:userId/follow — Follow a user
// ---------------------------------------------------------------------------
router.post("/:userId/follow", authenticate, async (req, res) => {
  const currentUid = req.user.uid;
  const targetUid = req.params.userId;

  if (currentUid === targetUid) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  try {
    const { FieldValue } = admin.firestore;
    const batch = db.batch();
    const myRef = db.collection("users").doc(currentUid);
    const targetRef = db.collection("users").doc(targetUid);
    const myFriendRef = myRef.collection("friends").doc(targetUid);
    // Add targetUid to current user's followingCount array
    batch.set(
      myRef,
      { followingCount: FieldValue.arrayUnion(targetUid) },
      { merge: true }
    );
    // Add currentUid to target user's followerCount array
    batch.set(
      targetRef,
      { followerCount: FieldValue.arrayUnion(currentUid) },
      { merge: true }
    );
    // Keep friends subcollection in sync with follow state.
    batch.set(
      myFriendRef,
      {
        uid: targetUid,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/:userId/follow error:", err);
    return res.status(500).json({ error: "Failed to follow user" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:userId/unfollow — Unfollow a user
// ---------------------------------------------------------------------------
router.post("/:userId/unfollow", authenticate, async (req, res) => {
  const currentUid = req.user.uid;
  const targetUid = req.params.userId;

  try {
    const { FieldValue } = admin.firestore;
    const batch = db.batch();
    const myRef = db.collection("users").doc(currentUid);
    const targetRef = db.collection("users").doc(targetUid);
    const myFriendRef = myRef.collection("friends").doc(targetUid);
    batch.set(
      myRef,
      { followingCount: FieldValue.arrayRemove(targetUid) },
      { merge: true }
    );
    batch.set(
      targetRef,
      { followerCount: FieldValue.arrayRemove(currentUid) },
      { merge: true }
    );
    batch.delete(myFriendRef);
    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/:userId/unfollow error:", err);
    return res.status(500).json({ error: "Failed to unfollow user" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:userId/followers — Get list of users following :userId
// ---------------------------------------------------------------------------
router.get("/:userId/followers", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.userId).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    const followerUids = doc.data().followerCount;
    if (!Array.isArray(followerUids) || followerUids.length === 0) {
      return res.json([]);
    }

    const snapshots = await Promise.all(
      followerUids.map((uid) => db.collection("users").doc(uid).get())
    );
    const users = snapshots
      .filter((s) => s.exists)
      .map((s) => ({
        id: s.id,
        name: s.data().displayName || "",
        username: s.data().username || "",
        avatar: s.data().avatar || s.data().photoURL || null,
      }));
    return res.json(users);
  } catch (err) {
    console.error("GET /api/users/:userId/followers error:", err);
    return res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:userId/following — Get list of users :userId follows
// ---------------------------------------------------------------------------
router.get("/:userId/following", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.userId).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    const followingUids = doc.data().followingCount;
    if (!Array.isArray(followingUids) || followingUids.length === 0) {
      return res.json([]);
    }

    const snapshots = await Promise.all(
      followingUids.map((uid) => db.collection("users").doc(uid).get())
    );
    const users = snapshots
      .filter((s) => s.exists)
      .map((s) => ({
        id: s.id,
        name: s.data().displayName || "",
        username: s.data().username || "",
        avatar: s.data().avatar || s.data().photoURL || null,
      }));
    return res.json(users);
  } catch (err) {
    console.error("GET /api/users/:userId/following error:", err);
    return res.status(500).json({ error: "Failed to fetch following" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id — Get a specific user's profile
// Replaces: getDoc(doc(db, "users", friendName)) in FriendProfilePage.tsx
// IMPORTANT: This catch-all must be defined AFTER all specific /:id/... routes
// ---------------------------------------------------------------------------
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const data = doc.data();
    return res.json({
      id: doc.id,
      displayName: data.displayName || "",
      username: data.username || "",
      bio: data.bio || "",
      avatar: data.avatar || null,
      followerCount: data.followerCount || [],
      followingCount: data.followingCount || [],
      points: data.points || 0,
    });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/users/me — Update current user's profile
// For settings page, updating bio, avatar, location, etc.
// ---------------------------------------------------------------------------
router.put("/me", authenticate, async (req, res) => {
  try {
    const allowedFields = ["displayName", "bio", "avatar", "lat", "lng"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection("users").doc(req.user.uid).set(updates, { merge: true });

    return res.json({ id: req.user.uid, ...updates });
  } catch (err) {
    console.error("PUT /api/users/me error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
