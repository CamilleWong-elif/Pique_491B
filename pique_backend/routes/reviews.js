const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/reviews — Submit a review for an event
// Replaces: addDoc(collection(db, "reviews"), {...}) in LeaveReviewPage.tsx
//
// Awards points: +5 for review with text, +3 for rating only
// (matches CommunityPage "How Points Work" modal)
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

    // Verify event exists
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get user info for denormalized fields
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const reviewData = {
      event: eventId,
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

    // Award points (+5 for review with text, +3 for rating-only)
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

// ---------------------------------------------------------------------------
// GET /api/reviews?eventId=xxx — Get reviews for a specific event
// Used by EventDetailPage to show real reviews instead of hardcoded ones
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const { eventId } = req.query;

    let query = db.collection("reviews").orderBy("createdAt", "desc");

    if (eventId) {
      query = db
        .collection("reviews")
        .where("event", "==", eventId)
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.limit(50).get();
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(reviews);
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/reviews/friends — Get reviews from friends
// Used by CommunityPage "Friend Reviews" tab & LeaderboardPage
// ---------------------------------------------------------------------------
router.get("/friends", authenticate, async (req, res) => {
  try {
    const friendsSnap = await db
      .collection("users")
      .doc(req.user.uid)
      .collection("friends")
      .get();
    const friendIds = friendsSnap.docs.map((doc) => doc.id);

    if (friendIds.length === 0) {
      return res.json([]);
    }

    // Firestore 'in' queries support max 30 items
    const allReviews = [];
    for (let i = 0; i < friendIds.length; i += 30) {
      const batch = friendIds.slice(i, i + 30);
      const snap = await db
        .collection("reviews")
        .where("author", "in", batch)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      for (const doc of snap.docs) {
        allReviews.push({ id: doc.id, ...doc.data() });
      }
    }

    // Sort: highest rating first, then most recent
    allReviews.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    return res.json(allReviews);
  } catch (err) {
    console.error("GET /api/reviews/friends error:", err);
    return res.status(500).json({ error: "Failed to fetch friend reviews" });
  }
});

module.exports = router;
