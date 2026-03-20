const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

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
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Optional server-side filtering (client can also filter)
    let filtered = events;

    const { category, search } = req.query;

    if (category && category !== "All") {
      filtered = filtered.filter(
        (e) => e.categories && e.categories.includes(category)
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter((e) => {
        const name = String(e.name || "").toLowerCase();
        const city = String(e.city || "").toLowerCase();
        const state = String(e.state || "").toLowerCase();
        return name.includes(q) || city.includes(q) || state.includes(q);
      });
    }

    return res.json(filtered);
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
    const likedEvents = userDoc.data()?.likedEvents || [];
    const isLiked = likedEvents.includes(req.params.id);

    if (isLiked) {
      await userRef.set({ likedEvents: FieldValue.arrayRemove(req.params.id) }, { merge: true });
    } else {
      await userRef.set({ likedEvents: FieldValue.arrayUnion(req.params.id) }, { merge: true });
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
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("GET /api/events/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

module.exports = router;
