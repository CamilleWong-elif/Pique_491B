const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldPath, FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

function toIsoTimestamp(value) {
  if (!value) return new Date(0).toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date(0).toISOString();
  return d.toISOString();
}

function pickAvatar(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.avatarDataUrl || userData.avatar || userData.photoURL || null;
}

function pickName(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.displayName || userData.username || "User";
}

async function getUsersByIds(ids) {
  const unique = [...new Set(ids.filter((id) => typeof id === "string" && id.trim().length > 0))];
  if (unique.length === 0) return new Map();
  const map = new Map();
  for (let i = 0; i < unique.length; i += 30) {
    const batch = unique.slice(i, i + 30);
    const usersSnap = await db.collection("users").where(FieldPath.documentId(), "in", batch).get();
    usersSnap.docs.forEach((doc) => {
      map.set(doc.id, doc.data() || {});
    });
  }
  return map;
}

router.get("/", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const rawLimit = Number(req.query?.limit ?? 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 100)) : 50;

    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const readIds = Array.isArray(userData?.notificationReadIds)
      ? userData.notificationReadIds.filter((id) => typeof id === "string")
      : [];
    const readIdSet = new Set(readIds);
    const readAllAtIso = toIsoTimestamp(userData?.notificationsReadAllAt);
    const readAllAtMs = new Date(readAllAtIso).getTime();
    const followerIds = Array.isArray(userData?.followerCount)
      ? userData.followerCount.filter((id) => typeof id === "string" && id !== uid)
      : [];

    const [reviewsByAuthor, reviewsByAuthorId, reviewsByUserId, activitiesByAuthor, activitiesByAuthorId, activitiesByUserId] =
      await Promise.all([
        db.collection("reviews").where("author", "==", uid).limit(80).get(),
        db.collection("reviews").where("authorId", "==", uid).limit(80).get(),
        db.collection("reviews").where("userId", "==", uid).limit(80).get(),
        db.collection("activities").where("author", "==", uid).limit(80).get(),
        db.collection("activities").where("authorId", "==", uid).limit(80).get(),
        db.collection("activities").where("userId", "==", uid).limit(80).get(),
      ]);

    const reviews = new Map();
    [reviewsByAuthor, reviewsByAuthorId, reviewsByUserId].forEach((snapshot) => {
      snapshot.docs.forEach((doc) => reviews.set(doc.id, doc.data() || {}));
    });

    const activities = new Map();
    [activitiesByAuthor, activitiesByAuthorId, activitiesByUserId].forEach((snapshot) => {
      snapshot.docs.forEach((doc) => activities.set(doc.id, doc.data() || {}));
    });

    const actorIds = new Set(followerIds);
    reviews.forEach((review) => {
      const likedBy = Array.isArray(review?.likedBy) ? review.likedBy : [];
      likedBy.forEach((id) => {
        if (typeof id === "string" && id !== uid) actorIds.add(id);
      });
      const comments = Array.isArray(review?.comments) ? review.comments : [];
      comments.forEach((comment) => {
        const actorId = String(comment?.userId || "").trim();
        if (actorId && actorId !== uid) actorIds.add(actorId);
      });
    });
    activities.forEach((activity) => {
      const likedBy = Array.isArray(activity?.likedBy) ? activity.likedBy : [];
      likedBy.forEach((id) => {
        if (typeof id === "string" && id !== uid) actorIds.add(id);
      });
      const comments = Array.isArray(activity?.comments) ? activity.comments : [];
      comments.forEach((comment) => {
        const actorId = String(comment?.userId || "").trim();
        if (actorId && actorId !== uid) actorIds.add(actorId);
      });
    });

    const usersById = await getUsersByIds(Array.from(actorIds));
    const notifications = [];

    followerIds.forEach((followerId) => {
      const follower = usersById.get(followerId);
      if (!follower) return;
      const followTs = toIsoTimestamp(follower?.updatedAt || follower?.createdAt || new Date().toISOString());
      notifications.push({
        id: `follow_${followerId}`,
        type: "follow",
        userId: followerId,
        userName: pickName(follower),
        userAvatar: pickAvatar(follower),
        message: "started following you",
        eventName: null,
        timestamp: followTs,
      });
    });

    reviews.forEach((review, reviewId) => {
      const eventName = String(review?.eventName || "your review");
      const reviewUpdatedTs = toIsoTimestamp(review?.updatedAt || review?.createdAt);
      const likedBy = Array.isArray(review?.likedBy) ? review.likedBy : [];
      likedBy.forEach((actorId) => {
        if (typeof actorId !== "string" || actorId === uid) return;
        const actor = usersById.get(actorId);
        if (!actor) return;
        notifications.push({
          id: `review_like_${reviewId}_${actorId}`,
          type: "review_like",
          userId: actorId,
          userName: pickName(actor),
          userAvatar: pickAvatar(actor),
          message: "liked your review",
          eventName,
          timestamp: reviewUpdatedTs,
        });
      });

      const comments = Array.isArray(review?.comments) ? review.comments : [];
      comments.forEach((comment, idx) => {
        const actorId = String(comment?.userId || "").trim();
        if (!actorId || actorId === uid) return;
        const actor = usersById.get(actorId);
        notifications.push({
          id: `review_comment_${reviewId}_${comment?.id || idx}`,
          type: "review_comment",
          userId: actor ? actorId : undefined,
          userName: String(comment?.userName || pickName(actor) || "User"),
          userAvatar: comment?.userAvatar || pickAvatar(actor),
          message: "commented on your review",
          eventName,
          timestamp: toIsoTimestamp(comment?.timestamp || reviewUpdatedTs),
        });
      });
    });

    activities.forEach((activity, activityId) => {
      const eventName = String(activity?.eventName || "your activity");
      const activityUpdatedTs = toIsoTimestamp(activity?.updatedAt || activity?.createdAt);
      const likedBy = Array.isArray(activity?.likedBy) ? activity.likedBy : [];
      likedBy.forEach((actorId) => {
        if (typeof actorId !== "string" || actorId === uid) return;
        const actor = usersById.get(actorId);
        if (!actor) return;
        notifications.push({
          id: `activity_like_${activityId}_${actorId}`,
          type: "activity_like",
          userId: actorId,
          userName: pickName(actor),
          userAvatar: pickAvatar(actor),
          message: "liked your bookmark activity",
          eventName,
          timestamp: activityUpdatedTs,
        });
      });

      const comments = Array.isArray(activity?.comments) ? activity.comments : [];
      comments.forEach((comment, idx) => {
        const actorId = String(comment?.userId || "").trim();
        if (!actorId || actorId === uid) return;
        const actor = usersById.get(actorId);
        notifications.push({
          id: `activity_comment_${activityId}_${comment?.id || idx}`,
          type: "activity_comment",
          userId: actor ? actorId : undefined,
          userName: String(comment?.userName || pickName(actor) || "User"),
          userAvatar: comment?.userAvatar || pickAvatar(actor),
          message: "commented on your bookmark activity",
          eventName,
          timestamp: toIsoTimestamp(comment?.timestamp || activityUpdatedTs),
        });
      });
    });

    notifications.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    const withReadState = notifications.map((item) => {
      const itemMs = new Date(item.timestamp).getTime();
      const readByReadAll = Number.isFinite(readAllAtMs) && Number.isFinite(itemMs) && itemMs <= readAllAtMs;
      return {
        ...item,
        read: readByReadAll || readIdSet.has(item.id),
      };
    });
    return res.json(withReadState.slice(0, limit));
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/read", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const notificationId = String(req.body?.notificationId || "").trim();
    if (!notificationId) {
      return res.status(400).json({ error: "notificationId is required" });
    }
    await db.collection("users").doc(uid).set(
      {
        notificationReadIds: FieldValue.arrayUnion(notificationId),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return res.json({ ok: true, notificationId });
  } catch (err) {
    console.error("POST /api/notifications/read error:", err);
    return res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

router.post("/read-all", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const nowIso = new Date().toISOString();
    await db.collection("users").doc(uid).set(
      {
        notificationsReadAllAt: nowIso,
        notificationReadIds: [],
        updatedAt: nowIso,
      },
      { merge: true }
    );
    return res.json({ ok: true, readAllAt: nowIso });
  } catch (err) {
    console.error("POST /api/notifications/read-all error:", err);
    return res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

module.exports = router;
