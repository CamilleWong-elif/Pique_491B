const express = require("express");
const { admin, db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const PROVIDER_MAP = {
  password: "password",
  "google.com": "google.com",
  "microsoft.com": "microsoft.com",
  "apple.com": "apple.com",
};

function normalizeProviders(providerIds = []) {
  const mapped = providerIds
    .map((id) => PROVIDER_MAP[id] || id)
    .filter(Boolean);
  return Array.from(new Set(mapped));
}

function inferPrimaryProvider(providers = []) {
  if (providers.includes("password")) return "password";
  return providers[0] || "";
}

function withProviderFallbacks({
  providers = [],
  uid = "",
  email = "",
  existingProviders = [],
}) {
  if (providers.length > 0) return providers;
  if (Array.isArray(existingProviders) && existingProviders.length > 0) return existingProviders;
  if (String(uid).startsWith("microsoft_")) return ["microsoft.com"];
  if (String(email).toLowerCase().endsWith("@student.csulb.edu")) return ["microsoft.com"];
  return [];
}

// ---------------------------------------------------------------------------
// GET /api/auth/email-auth-status?email=... — Check account providers by email
// Returns whether account exists and which auth providers are linked.
// ---------------------------------------------------------------------------
router.get("/email-auth-status", async (req, res) => {
  try {
    const emailRaw = String(req.query.email || "").trim();
    const email = emailRaw.toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const existingDoc = await db.collection("users").doc(userRecord.uid).get();
      const existingProviders = existingDoc.exists ? existingDoc.data()?.authProviders || [] : [];
      const rawProviders = normalizeProviders((userRecord.providerData || []).map((p) => p.providerId));
      const providers = withProviderFallbacks({
        providers: rawProviders,
        uid: userRecord.uid,
        email,
        existingProviders,
      });
      const primaryAuthProvider = inferPrimaryProvider(providers);

      // Keep users doc in sync for quick client checks later.
      await db.collection("users").doc(userRecord.uid).set(
        {
          email,
          authProviders: providers,
          primaryAuthProvider,
        },
        { merge: true }
      );

      return res.json({
        exists: true,
        providers,
        hasPassword: providers.includes("password"),
        primaryAuthProvider,
      });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        return res.json({ exists: false, providers: [], hasPassword: false, primaryAuthProvider: "" });
      }
      throw err;
    }
  } catch (err) {
    console.error("GET /api/auth/email-auth-status error:", err);
    return res.status(500).json({ error: "Failed to check email auth status" });
  }
});

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

    await db.collection("users").doc(uid).set(
      {
        email: (email || "").toLowerCase(),
        authProviders: ["microsoft.com"],
        primaryAuthProvider: "microsoft.com",
      },
      { merge: true }
    );

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
      email: (req.user.email || "").toLowerCase(),
      authProviders: ["password"],
      primaryAuthProvider: "password",
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
    const authUser = await admin.auth().getUser(req.user.uid);
    const existing = userDoc.exists ? userDoc.data() || {} : {};
    const rawProviders = normalizeProviders((authUser.providerData || []).map((p) => p.providerId));
    const authProviders = withProviderFallbacks({
      providers: rawProviders,
      uid: req.user.uid,
      email: authUser.email || "",
      existingProviders: existing.authProviders || [],
    });
    const primaryAuthProvider = inferPrimaryProvider(authProviders);

    const defaultUserData = {
      displayName: authUser.displayName || "",
      username: "",
      email: (authUser.email || "").toLowerCase(),
      authProviders,
      primaryAuthProvider,
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

    if (userDoc.exists) {
      const patch = {};

      for (const [key, value] of Object.entries(defaultUserData)) {
        if (existing[key] === undefined) {
          patch[key] = value;
        }
      }

      // Always keep auth/provider identity fields current.
      patch.authProviders = authProviders;
      patch.primaryAuthProvider = primaryAuthProvider;
      if (authUser.email) patch.email = authUser.email.toLowerCase();
      if (authUser.photoURL && (existing.photoURL == null || existing.photoURL === "")) {
        patch.photoURL = authUser.photoURL;
      }
      if (authUser.displayName && (!existing.displayName || !String(existing.displayName).trim())) {
        patch.displayName = authUser.displayName;
      }

      if (Object.keys(patch).length > 0) {
        await userRef.set(patch, { merge: true });
      }

      const refreshedDoc = await userRef.get();
      return res.json({ id: req.user.uid, ...refreshedDoc.data(), created: false });
    }

    await userRef.set(defaultUserData);

    return res.status(201).json({ id: req.user.uid, ...defaultUserData, created: true });
  } catch (err) {
    console.error("POST /api/auth/ensure-profile error:", err);
    return res.status(500).json({ error: "Failed to ensure user profile" });
  }
});

module.exports = router;
