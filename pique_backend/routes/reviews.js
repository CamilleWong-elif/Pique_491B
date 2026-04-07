const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue, FieldPath } = require("firebase-admin/firestore");

const router = express.Router();

async function refreshEventReviewStats(eventId) {
  if (!eventId) return;
  const [eventFieldSnap, eventIdFieldSnap] = await Promise.all([
    db.collection("reviews").where("event", "==", eventId).get(),
    db.collection("reviews").where("eventId", "==", eventId).get(),
  ]);
  const reviewMap = new Map();
  eventFieldSnap.docs.forEach((doc) => reviewMap.set(doc.id, doc.data()));
  eventIdFieldSnap.docs.forEach((doc) => reviewMap.set(doc.id, doc.data()));
  const reviews = Array.from(reviewMap.values())
    .filter((r) => typeof r?.rating === "number" && Number.isFinite(r.rating));
  const reviewCount = reviews.length;
  const rating =
    reviewCount === 0
      ? 0
      : Number(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
        );
  await db.collection("events").doc(eventId).set(
    {
      rating,
      reviewCount,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

function normalizeReviewForResponse(id, review, requestedEventId) {
  return {
    id,
    ...review,
    event: review.event || review.eventId || requestedEventId || "",
    eventId: review.eventId || review.event || requestedEventId || "",
  };
}

// ---------------------------------------------------------------------------
// POST /api/reviews — Submit a review for an event
// ---------------------------------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Review text is required" });
    }

    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const reviewData = {
      event: eventId,
      eventId,
      eventName: eventDoc.data().name || "",
      author: req.user.uid,
      friendName: userData.displayName || "Anonymous",
      friendAvatar: userData.avatar || null,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("reviews").add(reviewData);
    await refreshEventReviewStats(eventId);

    const pointsEarned = comment.trim() ? 5 : 3;
    await db.collection("users").doc(req.user.uid).update({
      points: FieldValue.increment(pointsEarned),
    });

    return res.status(201).json({
      id: docRef.id,
      ...reviewData,
      pointsEarned,
    });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return res.status(500).json({ error: "Failed to submit review" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const { eventId } = req.query;

    if (eventId) {
      const [eventFieldSnap, eventIdFieldSnap] = await Promise.all([
        db.collection("reviews").where("event", "==", eventId).get(),
        db.collection("reviews").where("eventId", "==", eventId).get(),
      ]);
      const reviewMap = new Map();
      eventFieldSnap.docs.forEach((doc) =>
        reviewMap.set(doc.id, normalizeReviewForResponse(doc.id, doc.data(), String(eventId)))
      );
      eventIdFieldSnap.docs.forEach((doc) =>
        reviewMap.set(doc.id, normalizeReviewForResponse(doc.id, doc.data(), String(eventId)))
      );

      const reviews = Array.from(reviewMap.values())
        .sort((a, b) => (String(b.createdAt || "")).localeCompare(String(a.createdAt || "")))
        .slice(0, 50);
      return res.json(reviews);
    }

    const snapshot = await db.collection("reviews").orderBy("createdAt", "desc").limit(50).get();
    const reviews = snapshot.docs.map((doc) => normalizeReviewForResponse(doc.id, doc.data()));
    return res.json(reviews);
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/reviews/friends — Get reviews from people you follow plus your own
// Used by HomePage activity feed, CommunityPage "Friend Reviews" tab
// ---------------------------------------------------------------------------
router.get("/friends", authenticate, async (req, res) => {
  try {
    const normalize = (value) =>
      typeof value === "string" ? value.trim().toLowerCase() : "";

    const viewerUid = req.user.uid;

    const currentUserDoc = await db.collection("users").doc(viewerUid).get();
    const followingIds = currentUserDoc.exists
      ? currentUserDoc.data().followingCount || []
      : [];

    const friendsSnap = await db
      .collection("users")
      .doc(viewerUid)
      .collection("friends")
      .get();
    const subcollectionFriendIds = friendsSnap.docs.map((doc) => doc.id);
    const friendIds = Array.from(new Set([...followingIds, ...subcollectionFriendIds]))
      .filter((id) => typeof id === "string" && id.trim().length > 0 && id !== viewerUid);

    const allReviewsMap = new Map();

    // Always include the current user's reviews (home activity feed + community when following nobody).
    const ownByAuthor = await db.collection("reviews").where("author", "==", viewerUid).get();
    ownByAuthor.docs.forEach((doc) => {
      allReviewsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    const [ownByAuthorId, ownByUserId] = await Promise.all([
      db.collection("reviews").where("authorId", "==", viewerUid).limit(80).get(),
      db.collection("reviews").where("userId", "==", viewerUid).limit(80).get(),
    ]);
    ownByAuthorId.docs.forEach((doc) => {
      allReviewsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    ownByUserId.docs.forEach((doc) => {
      allReviewsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const friendUidSet = new Set(friendIds);
    const friendIdentitySet = new Set(friendIds.map(normalize));

    // Pull friend profiles so we can match legacy review docs authored by username/displayName.
    for (let i = 0; i < friendIds.length; i += 30) {
      const batch = friendIds.slice(i, i + 30);
      const usersSnap = await db.collection("users").where("__name__", "in", batch).get();
      usersSnap.docs.forEach((doc) => {
        const data = doc.data();
        const username = normalize(data.username);
        const displayName = normalize(data.displayName);
        if (username) friendIdentitySet.add(username);
        if (displayName) friendIdentitySet.add(displayName);
      });
    }

    // Firestore 'in' queries support max 30 items.
    // Avoid `in + orderBy` here to prevent composite-index failures.
    for (let i = 0; i < friendIds.length; i += 30) {
      const batch = friendIds.slice(i, i + 30);
      const snap = await db
        .collection("reviews")
        .where("author", "in", batch)
        .get();

      for (const doc of snap.docs) {
        allReviewsMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    }

    const selfData = currentUserDoc.exists ? currentUserDoc.data() : {};
    const selfIdentitySet = new Set(
      [normalize(viewerUid), normalize(selfData.username), normalize(selfData.displayName)].filter(
        Boolean
      )
    );

    // Fallback for older/manual docs where identity fields are not consistently uid-based.
    const recentReviewsSnap = await db
    .collection("reviews")
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    recentReviewsSnap.docs.forEach((doc) => {
      const review = doc.data();
      const authorRaw = String(
        review.author ??
          review.authorId ??
          review.userId ??
          review.uid ??
          review.authorUid ??
          ""
      ).trim();
      const reviewIdentityCandidates = [
        normalize(authorRaw),
        normalize(review.username),
        normalize(review.authorUsername),
        normalize(review.friendName),
      ].filter(Boolean);

      const matchesSelf =
        authorRaw === viewerUid ||
        review.authorId === viewerUid ||
        review.userId === viewerUid ||
        review.authorUid === viewerUid ||
        review.uid === viewerUid ||
        reviewIdentityCandidates.some((candidate) => selfIdentitySet.has(candidate));

      const matchesFriend =
        friendUidSet.has(authorRaw) ||
        reviewIdentityCandidates.some((candidate) =>
          friendIdentitySet.has(candidate)
        );

      if (matchesSelf || matchesFriend) {
        allReviewsMap.set(doc.id, { id: doc.id, ...review });
      }
    });

    const allReviews = Array.from(allReviewsMap.values());

    // Sort: most recent reviews first (ignore rating value)
    allReviews.sort((a, b) => {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    return res.json(allReviews.slice(0, 50));
  } catch (err) {
    console.error("GET /api/reviews/friends error:", err);
    return res.status(500).json({ error: "Failed to fetch friend reviews" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/reviews/:reviewId/like — Toggle like on a review
// Also tracks review IDs a user has liked in users/{uid}.likedReviews.
// ---------------------------------------------------------------------------
router.post("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const reviewRef = db.collection("reviews").doc(req.params.reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = reviewDoc.data();
    const likedBy = Array.isArray(review.likedBy) ? review.likedBy : [];
    const alreadyLiked = likedBy.includes(req.user.uid);
    const nextLiked = !alreadyLiked;

    await reviewRef.update({
      likedBy: nextLiked
        ? FieldValue.arrayUnion(req.user.uid)
        : FieldValue.arrayRemove(req.user.uid),
      likes: FieldValue.increment(nextLiked ? 1 : -1),
      updatedAt: new Date().toISOString(),
    });

    await db.collection("users").doc(req.user.uid).set(
      {
        likedReviews: nextLiked
          ? FieldValue.arrayUnion(req.params.reviewId)
          : FieldValue.arrayRemove(req.params.reviewId),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.json({ liked: nextLiked });
  } catch (err) {
    console.error("POST /api/reviews/:reviewId/like error:", err);
    return res.status(500).json({ error: "Failed to toggle review like" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/reviews/:reviewId/likes — List users who liked (for activity feed UI)
// ---------------------------------------------------------------------------
router.get("/:reviewId/likes", authenticate, async (req, res) => {
  try {
    const reviewDoc = await db.collection("reviews").doc(req.params.reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = reviewDoc.data();
    const likedBy = Array.isArray(review.likedBy) ? review.likedBy : [];
    const uidList = [...new Set(likedBy.filter((id) => typeof id === "string" && id.trim().length > 0))];

    const byUid = new Map();
    for (let i = 0; i < uidList.length; i += 10) {
      const batch = uidList.slice(i, i + 10);
      const usersSnap = await db.collection("users").where(FieldPath.documentId(), "in", batch).get();
      usersSnap.docs.forEach((doc) => {
        const u = doc.data();
        byUid.set(doc.id, {
          userId: doc.id,
          userName: u.displayName || u.username || "User",
          userAvatar: u.avatarDataUrl || u.avatar || u.photoURL || null,
        });
      });
    }

    const likers = uidList.map((uid) => {
      const row = byUid.get(uid);
      if (row) return row;
      return { userId: uid, userName: "User", userAvatar: null };
    });

    return res.json(likers);
  } catch (err) {
    console.error("GET /api/reviews/:reviewId/likes error:", err);
    return res.status(500).json({ error: "Failed to fetch review likes" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/reviews/:reviewId/comments — Get comments for a review
// ---------------------------------------------------------------------------
router.get("/:reviewId/comments", authenticate, async (req, res) => {
  try {
    const reviewDoc = await db.collection("reviews").doc(req.params.reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = reviewDoc.data();
    const comments = Array.isArray(review.comments) ? review.comments : [];
    return res.json(comments);
  } catch (err) {
    console.error("GET /api/reviews/:reviewId/comments error:", err);
    return res.status(500).json({ error: "Failed to fetch review comments" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/reviews/:reviewId/comments — Add a comment to a review
// Also tracks review IDs a user has commented on in users/{uid}.commentedReviews.
// ---------------------------------------------------------------------------
router.post("/:reviewId/comments", authenticate, async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const reviewRef = db.collection("reviews").doc(req.params.reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found" });
    }

    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const comment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: req.user.uid,
      userName: userData.displayName || "Anonymous",
      userAvatar: userData.avatarDataUrl || userData.avatar || userData.photoURL || null,
      text,
      timestamp: new Date().toISOString(),
    };

    await reviewRef.update({
      comments: FieldValue.arrayUnion(comment),
      updatedAt: new Date().toISOString(),
    });

    await db.collection("users").doc(req.user.uid).set(
      {
        commentedReviews: FieldValue.arrayUnion(req.params.reviewId),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.status(201).json(comment);
  } catch (err) {
    console.error("POST /api/reviews/:reviewId/comments error:", err);
    return res.status(500).json({ error: "Failed to post review comment" });
  }
});

module.exports = router;
