const express = require("express");
const { db } = require("../config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/users — List all users (excluding current user)
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
        photoURL: doc.data().photoURL || null,
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
// GET /api/users/check-username/:username — Check if a username is available
// ---------------------------------------------------------------------------
router.get("/check-username/:username", authenticate, async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const snapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    const taken = snapshot.docs.some((doc) => doc.id !== req.user.uid);
    return res.json({ available: !taken });
  } catch (err) {
    console.error("GET /api/users/check-username error:", err);
    return res.status(500).json({ error: "Failed to check username" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/search?q=term — Search users by username prefix
// ---------------------------------------------------------------------------
router.get("/search", authenticate, async (req, res) => {
  try {
    const q = String(req.query.q || "").toLowerCase().trim();
    if (!q) {
      return res.json([]);
    }

    const snapshot = await db
      .collection("users")
      .orderBy("username")
      .startAt(q)
      .endAt(q + "\uf8ff")
      .limit(20)
      .get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(users);
  } catch (err) {
    console.error("GET /api/users/search error:", err);
    return res.status(500).json({ error: "Failed to search users" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id — Get a specific user's profile
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
      photoURL: data.photoURL || null,
      followerCount: data.followerCount || [],
      followingCount: data.followingCount || [],
      likedEvents: data.likedEvents || [],
      points: data.points || 0,
    });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id/followers — Get a user's followers with profile data
// ---------------------------------------------------------------------------
router.get("/:id/followers", authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const followerUids = userDoc.data().followerCount || [];
    if (followerUids.length === 0) return res.json([]);

    const followers = [];
    for (let i = 0; i < followerUids.length; i += 30) {
      const batch = followerUids.slice(i, i + 30);
      const snap = await db.collection("users").where("__name__", "in", batch).get();
      snap.docs.forEach((d) =>
        followers.push({
          id: d.id,
          name: d.data().displayName || "",
          username: d.data().username || "",
          avatar: d.data().avatar || "",
        })
      );
    }

    return res.json(followers);
  } catch (err) {
    console.error("GET /api/users/:id/followers error:", err);
    return res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id/following — Get users that a user follows
// ---------------------------------------------------------------------------
router.get("/:id/following", authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingUids = userDoc.data().followingCount || [];
    if (followingUids.length === 0) return res.json([]);

    const following = [];
    for (let i = 0; i < followingUids.length; i += 30) {
      const batch = followingUids.slice(i, i + 30);
      const snap = await db.collection("users").where("__name__", "in", batch).get();
      snap.docs.forEach((d) =>
        following.push({
          id: d.id,
          name: d.data().displayName || "",
          username: d.data().username || "",
          avatar: d.data().avatar || "",
        })
      );
    }

    return res.json(following);
  } catch (err) {
    console.error("GET /api/users/:id/following error:", err);
    return res.status(500).json({ error: "Failed to fetch following" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:id/follow — Follow a user
// ---------------------------------------------------------------------------
router.post("/:id/follow", authenticate, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.uid) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const targetDoc = await db.collection("users").doc(targetId).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const myRef = db.collection("users").doc(req.user.uid);
    const theirRef = db.collection("users").doc(targetId);

    await myRef.update({ followingCount: FieldValue.arrayUnion(targetId) });
    await theirRef.update({ followerCount: FieldValue.arrayUnion(req.user.uid) });

    return res.json({ followed: true });
  } catch (err) {
    console.error("POST /api/users/:id/follow error:", err);
    return res.status(500).json({ error: "Failed to follow user" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:id/unfollow — Unfollow a user
// ---------------------------------------------------------------------------
router.post("/:id/unfollow", authenticate, async (req, res) => {
  try {
    const targetId = req.params.id;

    const myRef = db.collection("users").doc(req.user.uid);
    const theirRef = db.collection("users").doc(targetId);

    await myRef.update({ followingCount: FieldValue.arrayRemove(targetId) });
    await theirRef.update({ followerCount: FieldValue.arrayRemove(req.user.uid) });

    return res.json({ unfollowed: true });
  } catch (err) {
    console.error("POST /api/users/:id/unfollow error:", err);
    return res.status(500).json({ error: "Failed to unfollow user" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/users/me — Update current user's profile
// ---------------------------------------------------------------------------
router.put("/me", authenticate, async (req, res) => {
  try {
    const allowedFields = ["displayName", "bio", "avatar", "photoURL", "username", "lat", "lng"];
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
