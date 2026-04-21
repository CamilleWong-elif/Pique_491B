const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldPath } = require("firebase-admin/firestore");

const router = express.Router();

// Batch-fetch event docs by ID (Firestore caps "in" at 30)
async function fetchEventsByIds(ids) {
  if (ids.length === 0) return [];
  const docs = [];
  for (let i = 0; i < ids.length; i += 30) {
    const snap = await db.collection("events")
      .where(FieldPath.documentId(), "in", ids.slice(i, i + 30))
      .get();
    snap.docs.forEach((d) => docs.push(d));
  }
  return docs;
}

// ---------------------------------------------------------------------------
// GET /api/recommendations?limit=20 — Personalized event recommendations
//
// Signals used (ordered by weight):
//   1. Survey preferredCategories (10 pts per category)
//   2. Bookings                   (7 pts per event category)
//   3. Reviews / comments         (5 pts per event category)
//   4. Likes                      (3 pts per event category)
//   5. Friends' likes             (2 pts per event category)
//   6. Recent clicks              (1 pt per event category)
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const uid = req.user.uid;

    // 1. Load user profile
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userDoc.data();
    const preferredCategories = Array.isArray(userData.preferredCategories) ? userData.preferredCategories : [];
    const likedEvents = Array.isArray(userData.likedEvents) ? userData.likedEvents : [];
    const recentClicks = Array.isArray(userData.recentEventClicks) ? userData.recentEventClicks : [];
    const followingUids = Array.isArray(userData.followingCount) ? userData.followingCount : [];

    // 2. Build category affinity map
    const affinity = {};
    const addAffinity = (cat, weight) => { affinity[cat] = (affinity[cat] || 0) + weight; };

    // Survey preferences (weight 10)
    for (const cat of preferredCategories) {
      addAffinity(cat, 10);
    }

    // Likes (weight 3) + recent clicks (weight 1)
    const interactionEventIds = [...new Set([...likedEvents, ...recentClicks])];
    if (interactionEventIds.length > 0) {
      const eventDocs = await fetchEventsByIds(interactionEventIds);
      for (const doc of eventDocs) {
        const cats = Array.isArray(doc.data().categories) ? doc.data().categories : [];
        const isLiked = likedEvents.includes(doc.id);
        const isClicked = recentClicks.includes(doc.id);
        const weight = (isLiked ? 3 : 0) + (isClicked ? 1 : 0);
        for (const cat of cats) addAffinity(cat, weight);
      }
    }

    // Reviews + comments (weight 5) and bookings (weight 7)
    const [reviewSnap, bookingSnap, commentSnap] = await Promise.all([
      db.collection("reviews").where("userId", "==", uid).limit(50).get(),
      db.collection("bookings").where("userId", "==", uid).limit(50).get(),
      db.collection("reviews").where("commentedBy", "array-contains", uid).limit(50).get(),
    ]);

    const reviewedEventIds = new Set();
    for (const doc of reviewSnap.docs) {
      const eid = doc.data().eventId || doc.data().event;
      if (eid) reviewedEventIds.add(eid);
    }
    // Comments on reviews also count as engagement with that event
    for (const doc of commentSnap.docs) {
      const eid = doc.data().eventId || doc.data().event;
      if (eid) reviewedEventIds.add(eid);
    }

    const bookedEventIds = new Set();
    for (const doc of bookingSnap.docs) {
      const eid = doc.data().eventId;
      if (eid) bookedEventIds.add(eid);
    }

    const extraIds = [...new Set([...reviewedEventIds, ...bookedEventIds])];
    if (extraIds.length > 0) {
      const eventDocs = await fetchEventsByIds(extraIds);
      for (const doc of eventDocs) {
        const cats = Array.isArray(doc.data().categories) ? doc.data().categories : [];
        if (reviewedEventIds.has(doc.id)) {
          for (const cat of cats) addAffinity(cat, 5);
        }
        if (bookedEventIds.has(doc.id)) {
          for (const cat of cats) addAffinity(cat, 7);
        }
      }
    }

    // Friends' likes (weight 2) — what your friends are into influences your recs
    if (followingUids.length > 0) {
      const friendLikedEventIds = new Set();
      // Fetch friends' profiles (batch of 30)
      for (let i = 0; i < followingUids.length; i += 30) {
        const batch = followingUids.slice(i, i + 30);
        const friendSnap = await db.collection("users")
          .where(FieldPath.documentId(), "in", batch)
          .get();
        for (const fDoc of friendSnap.docs) {
          const fLiked = Array.isArray(fDoc.data().likedEvents) ? fDoc.data().likedEvents : [];
          fLiked.forEach((eid) => friendLikedEventIds.add(eid));
        }
      }

      if (friendLikedEventIds.size > 0) {
        const friendEventDocs = await fetchEventsByIds([...friendLikedEventIds].slice(0, 90));
        for (const doc of friendEventDocs) {
          const cats = Array.isArray(doc.data().categories) ? doc.data().categories : [];
          for (const cat of cats) addAffinity(cat, 2);
        }
      }
    }

    // 3. Fetch candidate events — targeted queries for user's top categories
    //    PLUS a general pool of newest events, merged and deduplicated.
    const candidateMap = new Map();

    // 3a. For each category the user has affinity for, fetch matching events
    const topCategories = Object.entries(affinity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    const categoryFetches = topCategories.map((cat) =>
      db.collection("events")
        .where("categories", "array-contains", cat)
        .limit(30)
        .get()
    );
    const categorySnaps = await Promise.all(categoryFetches);
    for (const snap of categorySnaps) {
      for (const doc of snap.docs) {
        if (!candidateMap.has(doc.id)) candidateMap.set(doc.id, doc);
      }
    }

    // 3b. Also fetch general newest events to fill gaps
    const generalSnap = await db.collection("events")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    for (const doc of generalSnap.docs) {
      if (!candidateMap.has(doc.id)) candidateMap.set(doc.id, doc);
    }

    const candidateDocs = Array.from(candidateMap.values());

    // 4. Score and rank
    const now = Date.now();
    const scored = [];
    for (const doc of candidateDocs) {
      const data = doc.data();
      const cats = Array.isArray(data.categories) ? data.categories : [];
      let score = 0;
      for (const cat of cats) {
        score += affinity[cat] || 0;
      }

      // Events with zero category affinity get pushed to the bottom — the user
      // hasn't expressed interest in any of this event's categories.
      if (score === 0) score = -100;

      // Time bonus: upcoming events rank higher
      if (data.startDate) {
        const eventTime = new Date(data.startDate).getTime();
        const daysUntil = (eventTime - now) / (1000 * 60 * 60 * 24);
        if (daysUntil >= 0 && daysUntil <= 7) score *= 1.3;
        else if (daysUntil > 7 && daysUntil <= 30) score *= 1.1;
      }

      // Small random factor so the list isn't identical every load
      score += Math.random() * 0.5;

      scored.push({ id: doc.id, ...data, score });
    }

    scored.sort((a, b) => b.score - a.score);

    // Only return events that have at least some affinity match,
    // unless there aren't enough (fall back to newest for cold-start)
    const matched = scored.filter((e) => e.score > 0);
    const pool = matched.length >= Math.min(5, limit) ? matched : scored;

    // Strip internal score
    const results = pool.slice(0, limit).map(({ score, ...rest }) => rest);

    return res.json(results);
  } catch (err) {
    console.error("GET /api/recommendations error:", err);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

module.exports = router;
