const express = require("express");
const { admin, db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/microsoft — Exchange a Microsoft access token for a Firebase
// custom token. The client obtains the MS access token via expo-auth-session,
// then sends it here. We verify it against Microsoft Graph, create/update a
// Firebase Auth user, and return a custom token the client can use with
// signInWithCustomToken.
// ---------------------------------------------------------------------------
router.post("/microsoft", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const graphResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!graphResponse.ok) {
      const text = await graphResponse.text();
      console.error("Microsoft Graph error:", text);
      return res.status(401).json({ error: "Invalid Microsoft access token" });
    }

    const profile = await graphResponse.json();
    const uid = `microsoft_${profile.id}`;
    const email = profile.mail || profile.userPrincipalName || null;

    try {
      await admin.auth().getUser(uid);
      await admin.auth().updateUser(uid, {
        displayName: profile.displayName,
        ...(email && { email }),
      });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        await admin.auth().createUser({
          uid,
          displayName: profile.displayName,
          ...(email && { email }),
        });
      } else {
        throw err;
      }
    }

    const customToken = await admin.auth().createCustomToken(uid);

    return res.json({ customToken, profile });
  } catch (err) {
    console.error("POST /api/auth/microsoft error:", err);
    return res.status(500).json({ error: "Microsoft authentication failed" });
  }
});

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
      followerCount: [],
      followingCount: [],
      likedEvents: [],
      likedReviews: [],
      commentedReviews: [],
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

// ---------------------------------------------------------------------------
// POST /api/auth/ensure-profile — Create user doc if it doesn't exist yet
//
// Called after Google (or any OAuth) sign-in. If the user already has a
// Firestore doc, this is a no-op. Otherwise it creates one using the
// Firebase Auth profile data (displayName, email, photoURL).
// ---------------------------------------------------------------------------
router.post("/ensure-profile", authenticate, async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.json({ id: req.user.uid, ...userDoc.data(), created: false });
    }

    // Pull info from Firebase Auth
    const authUser = await admin.auth().getUser(req.user.uid);

    const userData = {
      displayName: authUser.displayName || "",
      username: "",
      email: authUser.email || "",
      bio: "",
      avatar: null,
      photoURL: authUser.photoURL || null,
      points: 0,
      followerCount: [],
      followingCount: [],
      likedEvents: [],
      likedReviews: [],
      commentedReviews: [],
      lat: 0,
      lng: 0,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);

    return res.status(201).json({ id: req.user.uid, ...userData, created: true });
  } catch (err) {
    console.error("POST /api/auth/ensure-profile error:", err);
    return res.status(500).json({ error: "Failed to ensure user profile" });
  }
});

module.exports = router;
