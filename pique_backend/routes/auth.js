const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/register — Create user document after Firebase Auth signup
//
// Called right after createUserWithEmailAndPassword succeeds on the client.
// The client already has a Firebase Auth user, but we need a Firestore doc
// to store profile data (displayName, username, bio, points, etc.)
//
// Replaces the need for client-side setDoc after signup.
// ---------------------------------------------------------------------------
router.post("/register", authenticate, async (req, res) => {
  try {
    const { fullName, username, dateOfBirth } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
    }

    // Check username uniqueness
    const existingUser = await db
      .collection("users")
      .where("username", "==", username.toLowerCase())
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    const userData = {
      displayName: fullName.trim(),
      username: username.toLowerCase(),
      email: req.user.email || "",
      dateOfBirth: dateOfBirth || null,
      bio: "",
      avatar: null,
      points: 0,
      followerCount: 0,
      followingCount: 0,
      lat: 0,
      lng: 0,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(req.user.uid).set(userData);

    return res.status(201).json({ id: req.user.uid, ...userData });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return res.status(500).json({ error: "Failed to create user profile" });
  }
});

module.exports = router;
