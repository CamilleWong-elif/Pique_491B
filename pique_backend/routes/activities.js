const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue, FieldPath } = require("firebase-admin/firestore");

const router = express.Router();
const MAX_COMMENT_LENGTH = 500;
const MAX_ACTIVITY_COMMENTS = 200;

function pickAvatarFromUserData(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.avatarDataUrl || userData.avatar || userData.photoURL || null;
}

function pickDisplayNameFromUserData(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.displayName || userData.username || null;
}

async function resolveUserRows(uidList) {
  const ids = [...new Set(uidList.filter((id) => typeof id === "string" && id.trim().length > 0))];
  const usersByUid = new Map();
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const usersSnap = await db.collection("users").where(FieldPath.documentId(), "in", batch).get();
    usersSnap.docs.forEach((doc) => {
      const userData = doc.data();
      usersByUid.set(doc.id, {
        userId: doc.id,
        userName: pickDisplayNameFromUserData(userData) || "User",
        userAvatar: pickAvatarFromUserData(userData),
      });
    });
  }
  return usersByUid;
}

// ---------------------------------------------------------------------------
// POST /api/activities/:activityId/like — Toggle like on an activity
// ---------------------------------------------------------------------------
router.post("/:activityId/like", authenticate, async (req, res) => {
  try {
    const activityRef = db.collection("activities").doc(req.params.activityId);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const activity = activityDoc.data();
    const likedBy = Array.isArray(activity?.likedBy) ? activity.likedBy : [];
    const alreadyLiked = likedBy.includes(req.user.uid);
    const nextLiked = !alreadyLiked;

    await activityRef.set(
      {
        likedBy: nextLiked
          ? FieldValue.arrayUnion(req.user.uid)
          : FieldValue.arrayRemove(req.user.uid),
        likes: FieldValue.increment(nextLiked ? 1 : -1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.json({ liked: nextLiked });
  } catch (err) {
    console.error("POST /api/activities/:activityId/like error:", err);
    return res.status(500).json({ error: "Failed to toggle activity like" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/activities/:activityId/likes — List users who liked an activity
// ---------------------------------------------------------------------------
router.get("/:activityId/likes", authenticate, async (req, res) => {
  try {
    const activityDoc = await db.collection("activities").doc(req.params.activityId).get();
    if (!activityDoc.exists) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const activity = activityDoc.data();
    const uidList = Array.isArray(activity?.likedBy) ? activity.likedBy : [];
    const usersByUid = await resolveUserRows(uidList);
    const likers = uidList
      .filter((uid) => typeof uid === "string" && uid.trim().length > 0)
      .map((uid) => usersByUid.get(uid) || { userId: uid, userName: "User", userAvatar: null });

    return res.json(likers);
  } catch (err) {
    console.error("GET /api/activities/:activityId/likes error:", err);
    return res.status(500).json({ error: "Failed to fetch activity likes" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/activities/:activityId/comments — Get comments for an activity
// ---------------------------------------------------------------------------
router.get("/:activityId/comments", authenticate, async (req, res) => {
  try {
    const activityDoc = await db.collection("activities").doc(req.params.activityId).get();
    if (!activityDoc.exists) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const activity = activityDoc.data();
    const comments = Array.isArray(activity?.comments) ? activity.comments : [];
    return res.json(comments);
  } catch (err) {
    console.error("GET /api/activities/:activityId/comments error:", err);
    return res.status(500).json({ error: "Failed to fetch activity comments" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/activities/:activityId/comments — Add a comment to an activity
// ---------------------------------------------------------------------------
router.post("/:activityId/comments", authenticate, async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    if (text.length > MAX_COMMENT_LENGTH) {
      return res
        .status(400)
        .json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or less` });
    }

    const activityRef = db.collection("activities").doc(req.params.activityId);
    const activityDoc = await activityRef.get();
    if (!activityDoc.exists) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const comment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: req.user.uid,
      userName: pickDisplayNameFromUserData(userData) || "Anonymous",
      userAvatar: pickAvatarFromUserData(userData),
      text,
      timestamp: new Date().toISOString(),
    };

    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(activityRef);
      if (!snapshot.exists) {
        throw new Error("ACTIVITY_NOT_FOUND");
      }
      const current = snapshot.data() || {};
      const comments = Array.isArray(current.comments) ? current.comments : [];
      if (comments.length >= MAX_ACTIVITY_COMMENTS) {
        throw new Error("ACTIVITY_COMMENT_LIMIT_REACHED");
      }
      tx.set(
        activityRef,
        {
          comments: [...comments, comment],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });

    return res.status(201).json(comment);
  } catch (err) {
    if (err?.message === "ACTIVITY_NOT_FOUND") {
      return res.status(404).json({ error: "Activity not found" });
    }
    if (err?.message === "ACTIVITY_COMMENT_LIMIT_REACHED") {
      return res.status(400).json({
        error: `Comment limit reached for this activity (${MAX_ACTIVITY_COMMENTS})`,
      });
    }
    console.error("POST /api/activities/:activityId/comments error:", err);
    return res.status(500).json({ error: "Failed to post activity comment" });
  }
});

module.exports = router;
