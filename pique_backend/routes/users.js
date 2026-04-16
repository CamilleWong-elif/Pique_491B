const express = require("express");
const nodemailer = require("nodemailer");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();
const MAX_AVATAR_DATA_URL_LENGTH = 500000;

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
        avatar: doc.data().avatarDataUrl || doc.data().avatar || doc.data().photoURL || null,
        avatarDataUrl: doc.data().avatarDataUrl || null,
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
// GET /api/users/me/following — Get current user's following list
// ---------------------------------------------------------------------------
router.get("/me/following", authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
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
          displayName: d.data().displayName || "",
          username: d.data().username || "",
          avatar: d.data().avatarDataUrl || d.data().avatar || d.data().photoURL || "",
          avatarDataUrl: d.data().avatarDataUrl || null,
          photoURL: d.data().photoURL || null,
          lat: d.data().lat || 0,
          lng: d.data().lng || 0,
        })
      );
    }

    return res.json(following);
  } catch (err) {
    console.error("GET /api/users/me/following error:", err);
    return res.status(500).json({ error: "Failed to fetch following" });
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
      avatar: data.avatarDataUrl || data.avatar || data.photoURL || null,
      avatarDataUrl: data.avatarDataUrl || null,
      bannerDataUrl: data.bannerDataUrl || null,
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
          avatar: d.data().avatarDataUrl || d.data().avatar || d.data().photoURL || "",
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
          avatar: d.data().avatarDataUrl || d.data().avatar || d.data().photoURL || "",
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
    const currentUid = req.user.uid;
    if (targetId === req.user.uid) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const targetDoc = await db.collection("users").doc(targetId).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const myRef = db.collection("users").doc(currentUid);
    const theirRef = db.collection("users").doc(targetId);
    const myFriendRef = myRef.collection("friends").doc(targetId);
    const batch = db.batch();

    batch.update(myRef, { followingCount: FieldValue.arrayUnion(targetId) });
    batch.update(theirRef, { followerCount: FieldValue.arrayUnion(currentUid) });
    // Keep friends subcollection in sync with follow state.
    batch.set(
      myFriendRef,
      {
        uid: targetId,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    await batch.commit();

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
    const currentUid = req.user.uid;

    const myRef = db.collection("users").doc(currentUid);
    const theirRef = db.collection("users").doc(targetId);
    const myFriendRef = myRef.collection("friends").doc(targetId);
    const batch = db.batch();

    batch.update(myRef, { followingCount: FieldValue.arrayRemove(targetId) });
    batch.update(theirRef, { followerCount: FieldValue.arrayRemove(currentUid) });
    batch.delete(myFriendRef);
    await batch.commit();

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
    const allowedFields = ["displayName", "bio", "avatar", "photoURL", "avatarDataUrl", "bannerDataUrl", "username", "lat", "lng"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    if (updates.avatarDataUrl !== undefined) {
      if (typeof updates.avatarDataUrl !== "string") {
        return res.status(400).json({ error: "avatarDataUrl must be a string" });
      }
      if (!updates.avatarDataUrl.startsWith("data:image/")) {
        return res.status(400).json({ error: "avatarDataUrl must be an image data URL" });
      }
      if (updates.avatarDataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
        return res.status(400).json({ error: "avatarDataUrl is too large" });
      }
    }

    if (updates.bannerDataUrl !== undefined) {
      if (typeof updates.bannerDataUrl !== "string") {
        return res.status(400).json({ error: "bannerDataUrl must be a string" });
      }
      if (!updates.bannerDataUrl.startsWith("data:image/")) {
        return res.status(400).json({ error: "bannerDataUrl must be an image data URL" });
      }
      if (updates.bannerDataUrl.length > MAX_AVATAR_DATA_URL_LENGTH * 3) {
        return res.status(400).json({ error: "bannerDataUrl is too large" });
      }
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection("users").doc(req.user.uid).set(updates, { merge: true });

    return res.json({ id: req.user.uid, ...updates });
  } catch (err) {
    console.error("PUT /api/users/me error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// ---------------------------------------------------------------------------
// Shared SMTP helper
// ---------------------------------------------------------------------------
function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail({ to, subject, text, html }) {
  try {
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("sendMail error:", err);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/users/me — Soft-delete: anonymize profile, schedule permanent
//                        deletion in 30 days. Auth account is kept alive so
//                        the user can log back in to recover within that window.
// ---------------------------------------------------------------------------
router.delete("/me", authenticate, async (req, res) => {
  const uid = req.user.uid;
  try {
    const { admin } = require("../src/config/firebase");

    const authUser = await admin.auth().getUser(uid);
    const userEmail = authUser.email;

    // Snapshot the current profile so we can restore it on recovery
    const userSnap = await db.collection("users").doc(uid).get();
    const originalData = userSnap.exists ? userSnap.data() : {};

    // Stash original data in a separate collection
    const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.collection("pendingDeletion").doc(uid).set({
      originalData,
      email: userEmail,
      scheduledDeletionAt,
    });

    // Anonymize the public-facing profile immediately
    await db.collection("users").doc(uid).set({
      displayName: "Deleted User",
      username: null,
      bio: null,
      avatarDataUrl: null,
      photoURL: null,
      status: "pending_deletion",
      scheduledDeletionAt,
    });

    // Send a heads-up email (best-effort)
    if (userEmail) {
      const deletionDate = new Date(scheduledDeletionAt).toDateString();
      await sendMail({
        to: userEmail,
        subject: "Your Pique account is scheduled for deletion",
        text: [
          "Hi,",
          "",
          `Your Pique account has been scheduled for permanent deletion on ${deletionDate}.`,
          "Your public posts will appear as 'Deleted User' in the meantime.",
          "",
          "If you change your mind, log back into Pique within 30 days to recover your account.",
          "",
          "If you did not request this, contact us immediately at piquecsulb@gmail.com.",
          "",
          "— The Pique Team",
        ].join("\n"),
        html: `
          <p>Hi,</p>
          <p>Your Pique account has been scheduled for <strong>permanent deletion on ${deletionDate}</strong>.</p>
          <p>Your public posts will appear as "Deleted User" in the meantime.</p>
          <p>If you change your mind, <strong>log back into Pique within 30 days</strong> to recover your account.</p>
          <p>If you did not request this, contact us immediately at <a href="mailto:piquecsulb@gmail.com">piquecsulb@gmail.com</a>.</p>
          <p>— The Pique Team</p>
        `,
      });
    }

    return res.json({ success: true, scheduledDeletionAt });
  } catch (err) {
    console.error("DELETE /api/users/me error:", err);
    return res.status(500).json({ error: "Failed to schedule account deletion" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/me/recover — Cancel a pending deletion and restore profile
// ---------------------------------------------------------------------------
router.post("/me/recover", authenticate, async (req, res) => {
  const uid = req.user.uid;
  try {
    const pendingSnap = await db.collection("pendingDeletion").doc(uid).get();
    if (!pendingSnap.exists) {
      return res.status(400).json({ error: "No pending deletion found for this account" });
    }

    const { originalData, email, scheduledDeletionAt } = pendingSnap.data();

    // Only allow recovery before the scheduled deletion date
    if (new Date() >= new Date(scheduledDeletionAt)) {
      return res.status(410).json({ error: "Recovery window has expired" });
    }

    // Restore original profile
    await db.collection("users").doc(uid).set(originalData);

    // Clean up the pending deletion record
    await db.collection("pendingDeletion").doc(uid).delete();

    // Send recovery confirmation (best-effort)
    if (email) {
      await sendMail({
        to: email,
        subject: "Your Pique account has been recovered",
        text: [
          "Hi,",
          "",
          "Your Pique account has been successfully recovered. Everything is back to normal.",
          "",
          "If you did not request this, contact us immediately at piquecsulb@gmail.com.",
          "",
          "— The Pique Team",
        ].join("\n"),
        html: `
          <p>Hi,</p>
          <p>Your Pique account has been <strong>successfully recovered</strong>. Everything is back to normal.</p>
          <p>If you did not request this, contact us immediately at <a href="mailto:piquecsulb@gmail.com">piquecsulb@gmail.com</a>.</p>
          <p>— The Pique Team</p>
        `,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/me/recover error:", err);
    return res.status(500).json({ error: "Failed to recover account" });
  }
});

module.exports = router;
