const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue, FieldPath } = require("firebase-admin/firestore");

const router = express.Router();

function pickAvatarFromUserData(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.avatarDataUrl || userData.avatar || userData.photoURL || null;
}

function pickAvatarFromReview(review) {
  if (!review || typeof review !== "object") return null;
  return review.avatarDataUrl || review.photoURL || review.avatar || review.friendAvatar || null;
}

function pickDisplayNameFromUserData(userData) {
  if (!userData || typeof userData !== "object") return null;
  return userData.displayName || userData.username || null;
}

function pickDisplayNameFromReview(review) {
  if (!review || typeof review !== "object") return null;
  return (
    review.friendName ||
    review.authorUsername ||
    review.username ||
    review.displayName ||
    null
  );
}

function getReviewAuthorUid(review) {
  if (!review || typeof review !== "object") return "";
  const candidate =
    review.author ||
    review.authorId ||
    review.userId ||
    review.uid ||
    review.authorUid ||
    "";
  return typeof candidate === "string" ? candidate.trim() : "";
}

function normalizeReviewImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      const candidate =
        item.url ||
        item.uri ||
        item.image ||
        item.imageUrl ||
        item.src ||
        item.downloadURL ||
        "";
      return typeof candidate === "string" ? candidate.trim() : "";
    })
    .filter((url) => url.length > 0);
}

function withNormalizedReviewImages(review) {
  if (!review || typeof review !== "object") return review;
  return {
    ...review,
    images: normalizeReviewImages(review.images),
  };
}

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
  const normalizedReview = withNormalizedReviewImages(review);
  return {
    id,
    ...normalizedReview,
    event: normalizedReview.event || normalizedReview.eventId || requestedEventId || "",
    eventId: normalizedReview.eventId || normalizedReview.event || requestedEventId || "",
  };
}

// ---------------------------------------------------------------------------
// POST /api/reviews — Submit a review for an event
// ---------------------------------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventId, rating, comment, images } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Review text is required" });
    }
    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({ error: "images must be an array of URLs" });
    }

    const sanitizedImages = Array.isArray(images)
      ? images
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];
    if (sanitizedImages.length > 10) {
      return res.status(400).json({ error: "A maximum of 10 review images is allowed" });
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
      friendAvatar: userData.avatarDataUrl || userData.avatar || userData.photoURL || null,
      rating,
      comment: comment.trim(),
      images: sanitizedImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("reviews").add(reviewData);

    if (sanitizedImages.length > 0) {
      const galleryRows = sanitizedImages.map((url) => ({
        url,
        userName: userData.displayName || userData.username || "Anonymous",
      }));
      await db.collection("events").doc(eventId).set(
        {
          userImages: FieldValue.arrayUnion(...galleryRows),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

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
// GET /api/reviews/friends — Get social activity from people you follow plus your own
// Used by HomePage activity feed and CommunityPage "Friend Reviews" tab
// ---------------------------------------------------------------------------
router.get("/friends", authenticate, async (req, res) => {
  try {
    const normalize = (value) =>
      typeof value === "string" ? value.trim().toLowerCase() : "";

    const viewerUid = req.user.uid;

    const currentUserDoc = await db.collection("users").doc(viewerUid).get();
    const currentUserData = currentUserDoc.exists ? currentUserDoc.data() : {};
    const dismissedFeedActivityIds = Array.isArray(currentUserData.dismissedFeedActivityIds)
      ? currentUserData.dismissedFeedActivityIds
      : [];
    const dismissedFeedSet = new Set(
      dismissedFeedActivityIds.filter((id) => typeof id === "string" && id.trim().length > 0)
    );

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
      allReviewsMap.set(doc.id, { id: doc.id, ...withNormalizedReviewImages(doc.data()) });
    });
    const [ownByAuthorId, ownByUserId] = await Promise.all([
      db.collection("reviews").where("authorId", "==", viewerUid).limit(80).get(),
      db.collection("reviews").where("userId", "==", viewerUid).limit(80).get(),
    ]);
    ownByAuthorId.docs.forEach((doc) => {
      allReviewsMap.set(doc.id, { id: doc.id, ...withNormalizedReviewImages(doc.data()) });
    });
    ownByUserId.docs.forEach((doc) => {
      allReviewsMap.set(doc.id, { id: doc.id, ...withNormalizedReviewImages(doc.data()) });
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
        allReviewsMap.set(doc.id, { id: doc.id, ...withNormalizedReviewImages(doc.data()) });
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
        allReviewsMap.set(doc.id, { id: doc.id, ...withNormalizedReviewImages(review) });
      }
    });

    let allReviews = Array.from(allReviewsMap.values());

    const authorUids = Array.from(
      new Set(
        allReviews
          .map((review) => getReviewAuthorUid(review))
          .filter((uid) => typeof uid === "string" && uid.length > 0)
      )
    );

    const authorProfilesByUid = new Map();
    for (let i = 0; i < authorUids.length; i += 30) {
      const batch = authorUids.slice(i, i + 30);
      const usersSnap = await db.collection("users").where(FieldPath.documentId(), "in", batch).get();
      usersSnap.docs.forEach((doc) => {
        authorProfilesByUid.set(doc.id, doc.data());
      });
    }

    allReviews = allReviews.map((review) => {
      const authorUid = getReviewAuthorUid(review);
      const authorProfile = authorUid ? authorProfilesByUid.get(authorUid) : null;
      const resolvedAvatar = pickAvatarFromUserData(authorProfile) || pickAvatarFromReview(review);
      const resolvedName = pickDisplayNameFromUserData(authorProfile) || pickDisplayNameFromReview(review);

      if (!resolvedAvatar && !resolvedName) return review;

      return {
        ...review,
        ...(resolvedAvatar ? { friendAvatar: resolvedAvatar } : {}),
        ...(resolvedName ? { friendName: resolvedName } : {}),
      };
    });

    // Build bookmark/interested activities from current likedEvents state,
    // then hydrate/create documents in the dedicated "activities" collection.
    const relationshipUserIds = Array.from(new Set([viewerUid, ...friendIds]));
    const relationshipProfilesByUid = new Map();
    for (let i = 0; i < relationshipUserIds.length; i += 30) {
      const batch = relationshipUserIds.slice(i, i + 30);
      const usersSnap = await db.collection("users").where(FieldPath.documentId(), "in", batch).get();
      usersSnap.docs.forEach((doc) => {
        relationshipProfilesByUid.set(doc.id, doc.data());
      });
    }

    const interestedRows = [];
    const interestedEventIds = new Set();
    relationshipProfilesByUid.forEach((userData, uid) => {
      const likedEvents = Array.isArray(userData?.likedEvents) ? userData.likedEvents : [];
      likedEvents.forEach((eventId) => {
        if (typeof eventId !== "string" || !eventId.trim()) return;
        interestedRows.push({
          userId: uid,
          eventId,
          createdAt: userData?.updatedAt || userData?.createdAt || new Date().toISOString(),
        });
        interestedEventIds.add(eventId);
      });
    });

    const eventNamesById = new Map();
    const interestedEventIdList = Array.from(interestedEventIds);
    for (let i = 0; i < interestedEventIdList.length; i += 30) {
      const batch = interestedEventIdList.slice(i, i + 30);
      const eventsSnap = await db.collection("events").where(FieldPath.documentId(), "in", batch).get();
      eventsSnap.docs.forEach((doc) => {
        const eventData = doc.data();
        eventNamesById.set(doc.id, eventData?.name || "Event");
      });
    }

    const interestedActivityIds = interestedRows.map((row) => `interested_${row.userId}_${row.eventId}`);
    const existingInterestedById = new Map();
    for (let i = 0; i < interestedActivityIds.length; i += 30) {
      const batch = interestedActivityIds.slice(i, i + 30);
      const activitiesSnap = await db
        .collection("activities")
        .where(FieldPath.documentId(), "in", batch)
        .get();
      activitiesSnap.docs.forEach((doc) => {
        existingInterestedById.set(doc.id, { id: doc.id, ...doc.data() });
      });
    }

    const missingActivityWrites = [];
    const interestedActivities = interestedRows.map((row) => {
      const userData = relationshipProfilesByUid.get(row.userId) || {};
      const activityId = `interested_${row.userId}_${row.eventId}`;
      const existing = existingInterestedById.get(activityId);
      const nextData = {
        ...(existing || {}),
        id: activityId,
        type: "interested",
        action: "interested",
        author: row.userId,
        authorId: row.userId,
        userId: row.userId,
        event: row.eventId,
        eventId: row.eventId,
        eventName: eventNamesById.get(row.eventId) || "Event",
        friendName: pickDisplayNameFromUserData(userData) || "User",
        friendAvatar: pickAvatarFromUserData(userData),
        rating: existing?.rating ?? null,
        comment: existing?.comment ?? "",
        likes: existing?.likes ?? 0,
        likedBy: Array.isArray(existing?.likedBy) ? existing.likedBy : [],
        comments: Array.isArray(existing?.comments) ? existing.comments : [],
        createdAt: row.createdAt,
        updatedAt: existing?.updatedAt || row.createdAt,
      };
      if (!existing) {
        missingActivityWrites.push(
          db.collection("activities").doc(activityId).set(nextData, { merge: true })
        );
      }
      return nextData;
    });

    if (missingActivityWrites.length > 0) {
      await Promise.allSettled(missingActivityWrites);
    }

    const allActivities = [...allReviews, ...interestedActivities];
    allActivities.sort((a, b) => (String(b.createdAt || "")).localeCompare(String(a.createdAt || "")));

    const visible = allActivities.filter((item) => item?.id && !dismissedFeedSet.has(item.id));

    return res.json(visible.slice(0, 50));
  } catch (err) {
    console.error("GET /api/reviews/friends error:", err);
    return res.status(500).json({ error: "Failed to fetch friend reviews" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/reviews/feed/dismiss — Hide an activity card for this user only (does not unbookmark)
// Must be registered before /:reviewId routes.
// ---------------------------------------------------------------------------
router.post("/feed/dismiss", authenticate, async (req, res) => {
  try {
    const activityId = String(req.body?.activityId || "").trim();
    if (!activityId) {
      return res.status(400).json({ error: "activityId is required" });
    }

    await db.collection("users").doc(req.user.uid).set(
      {
        dismissedFeedActivityIds: FieldValue.arrayUnion(activityId),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.json({ dismissed: true });
  } catch (err) {
    console.error("POST /api/reviews/feed/dismiss error:", err);
    return res.status(500).json({ error: "Failed to dismiss feed activity" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/reviews/:reviewId — Delete a review authored by current user
// ---------------------------------------------------------------------------
router.delete("/:reviewId", authenticate, async (req, res) => {
  try {
    const reviewRef = db.collection("reviews").doc(req.params.reviewId);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = reviewDoc.data() || {};
    const authorUid = getReviewAuthorUid(review);
    if (!authorUid || authorUid !== req.user.uid) {
      return res.status(403).json({ error: "Not allowed to delete this review" });
    }

    const eventId = String(review.event || review.eventId || "").trim();
    const reviewImages = Array.isArray(review.images)
      ? review.images
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];

    await reviewRef.delete();

    if (eventId) {
      if (reviewImages.length > 0) {
        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data() || {};
          const existingUserImages = Array.isArray(eventData.userImages) ? eventData.userImages : [];
          const reviewImageSet = new Set(reviewImages);
          const nextUserImages = existingUserImages.filter((item) => {
            if (typeof item === "string") return !reviewImageSet.has(item.trim());
            if (!item || typeof item !== "object") return true;
            const url = typeof item.url === "string" ? item.url.trim() : "";
            return !url || !reviewImageSet.has(url);
          });
          await eventRef.set(
            {
              userImages: nextUserImages,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      await refreshEventReviewStats(eventId);
    }

    return res.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/reviews/:reviewId error:", err);
    return res.status(500).json({ error: "Failed to delete review" });
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
