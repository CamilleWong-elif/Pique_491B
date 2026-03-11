const express = require("express");
const { db } = require("../config/firebase");
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
// GET /api/users/:id — Get a specific user's profile
// Replaces: getDoc(doc(db, "users", friendName)) in FriendProfilePage.tsx
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
      bio: data.bio || "",
      avatar: data.avatar || null,
      followerCount: data.followerCount || 0,
      followingCount: data.followingCount || 0,
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
