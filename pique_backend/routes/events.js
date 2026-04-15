const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

function buildInterestedActivityId(userId, eventId) {
  return `interested_${userId}_${eventId}`;
}

function computeReviewStatsForEventReviews(reviews = []) {
  const rated = reviews.filter(
    (r) => typeof r?.rating === "number" && Number.isFinite(r.rating)
  );
  if (rated.length === 0) {
    return { rating: 0, reviewCount: 0 };
  }
  const total = rated.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / rated.length;
  return {
    rating: Number(avg.toFixed(1)),
    reviewCount: rated.length,
  };
}

// ---------------------------------------------------------------------------
// POST /api/events — Create a new event
// Replaces: addDoc(collection(db, "events"), {...}) in CreateEventPage.tsx
// ---------------------------------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      date,
      maxCapacity,
      ageRange,
      categories,
      ticketTiers,
      imageUrl,
      imageUrls,
    } = req.body;

    // ── Validation (mirrors CreateEventPage client-side checks) ──
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Event name is required" });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ error: "Date is required" });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: "Location is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }

    const validAgeRanges = ["Any", "Under 18", "18+", "21+"];
    if (ageRange && !validAgeRanges.includes(ageRange)) {
      return res.status(400).json({ error: "Invalid age range" });
    }

    if (maxCapacity !== null && maxCapacity !== undefined) {
      const cap = Number(maxCapacity);
      if (!Number.isInteger(cap) || cap <= 0) {
        return res.status(400).json({ error: "Max capacity must be a positive integer" });
      }
    }

    if (categories && categories.length > 3) {
      return res.status(400).json({ error: "Maximum 3 categories allowed" });
    }

    // ── Write to Firestore ──
    const eventData = {
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      date,
      maxCapacity: maxCapacity ? Number(maxCapacity) : null,
      ageRange: ageRange || "Any",
      categories: categories || [],
      ticketTiers: ticketTiers || [],
      imageUrl: imageUrl || null,
      imageUrls: imageUrls || [],
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("events").add(eventData);

    return res.status(201).json({ id: docRef.id, ...eventData });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return res.status(500).json({ error: "Failed to create event" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/events — List all events
// Replaces: getDocs(collection(db, 'events')) in ExplorePage.tsx
// Optional query params: ?category=Music&search=concert&lat=33.8&lng=-118.3
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const { category, search, createdBy, ids } = req.query;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);

    // Targeted fetch by doc IDs (used by ProfilePage for liked/booked events).
    // Firestore's documentId() `in` clause caps at 30, so batch.
    if (ids) {
      const idList = String(ids).split(",").map((s) => s.trim()).filter(Boolean);
      if (idList.length === 0) return res.json([]);
      const { FieldPath } = require("firebase-admin/firestore");
      const batches = [];
      for (let i = 0; i < idList.length; i += 30) {
        batches.push(
          db.collection("events")
            .where(FieldPath.documentId(), "in", idList.slice(i, i + 30))
            .get()
        );
      }
      const snaps = await Promise.all(batches);
      const events = snaps.flatMap((snap) =>
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data(), rating: 0, reviewCount: 0 }))
      );
      return res.json(events);
    }

    // Filter by creator (used by ProfilePage for posted events).
    if (createdBy) {
      const snapshot = await db
        .collection("events")
        .where("createdBy", "==", String(createdBy))
        .limit(limit)
        .get();
      const events = snapshot.docs.map((doc) => ({
        id: doc.id, ...doc.data(), rating: 0, reviewCount: 0,
      }));
      return res.json(events);
    }

    // Without a category filter we can safely orderBy createdAt to surface
    // the newest events first. With `array-contains` + orderBy we'd need a
    // composite index, so skip the ordering in that case.
    let query = db.collection("events");
    if (category && category !== "All") {
      query = query.where("categories", "array-contains", String(category));
    } else {
      query = query.orderBy("createdAt", "desc");
    }

    const fetchLimit = search ? limit * 4 : limit;
    const snapshot = await query.limit(fetchLimit).get();
    let events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // rating/reviewCount are computed on the detail endpoint now.
      rating: 0,
      reviewCount: 0,
    }));

    if (search) {
      const q = String(search).toLowerCase();
      events = events.filter((e) => {
        const name = String(e.name || "").toLowerCase();
        const city = String(e.city || "").toLowerCase();
        const state = String(e.state || "").toLowerCase();
        return name.includes(q) || city.includes(q) || state.includes(q);
      });
    }

    return res.json(events.slice(0, limit));
  } catch (err) {
    console.error("GET /api/events error:", err);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/events/:id/like — Toggle like on an event
// Adds/removes the event ID from the user's likedEvents array
// ---------------------------------------------------------------------------
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const eventDoc = await db.collection("events").doc(req.params.id).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const likedEvents = Array.isArray(userData?.likedEvents) ? userData.likedEvents : [];
    const isLiked = likedEvents.includes(req.params.id);
    const nowIso = new Date().toISOString();
    const activityId = buildInterestedActivityId(req.user.uid, req.params.id);
    const activityRef = db.collection("activities").doc(activityId);

    if (isLiked) {
      await userRef.set({ likedEvents: FieldValue.arrayRemove(req.params.id) }, { merge: true });
      await activityRef.delete().catch(() => null);
    } else {
      await userRef.set({ likedEvents: FieldValue.arrayUnion(req.params.id) }, { merge: true });
      await activityRef.set(
        {
          id: activityId,
          type: "interested",
          action: "interested",
          author: req.user.uid,
          authorId: req.user.uid,
          userId: req.user.uid,
          event: req.params.id,
          eventId: req.params.id,
          eventName: eventDoc.data()?.name || "Event",
          friendName: userData?.displayName || userData?.username || "User",
          friendAvatar: userData?.avatarDataUrl || userData?.avatar || userData?.photoURL || null,
          likes: 0,
          likedBy: [],
          comments: [],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }

    return res.json({ liked: !isLiked });
  } catch (err) {
    console.error("POST /api/events/:id/like error:", err);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/events/:id — Get a single event by ID
// Used by EventDetailPage when navigating to a specific event
// ---------------------------------------------------------------------------
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("events").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }
    const [eventFieldSnap, eventIdFieldSnap] = await Promise.all([
      db.collection("reviews").where("event", "==", doc.id).get(),
      db.collection("reviews").where("eventId", "==", doc.id).get(),
    ]);
    const reviewMap = new Map();
    eventFieldSnap.docs.forEach((reviewDoc) => reviewMap.set(reviewDoc.id, reviewDoc.data()));
    eventIdFieldSnap.docs.forEach((reviewDoc) => reviewMap.set(reviewDoc.id, reviewDoc.data()));
    const stats = computeReviewStatsForEventReviews(
      Array.from(reviewMap.values())
    );
    return res.json({ id: doc.id, ...doc.data(), ...stats });
  } catch (err) {
    console.error("GET /api/events/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

module.exports = router;
