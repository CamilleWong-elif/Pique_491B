const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/bookings — Create a booking after payment
// Called from PaymentPage after successful payment processing.
// Awards +2 points for booking (matches "How Points Work" modal).
// ---------------------------------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventId, quantity, total, email, phoneNumber } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: "Quantity must be between 1 and 10" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Verify event exists
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Generate confirmation number
    const confirmationNumber = `EVT-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    const bookingData = {
      userId: req.user.uid,
      eventId,
      eventName: eventDoc.data().name || "",
      quantity,
      total,
      email: email.trim(),
      phoneNumber: phoneNumber || null,
      confirmationNumber,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("bookings").add(bookingData);

    // Award +2 points for booking ("Mark Going")
    await db.collection("users").doc(req.user.uid).update({
      points: FieldValue.increment(2),
    });

    return res.status(201).json({
      id: docRef.id,
      ...bookingData,
      pointsEarned: 2,
    });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return res.status(500).json({ error: "Failed to create booking" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings — Get current user's bookings
// Used by ProfilePage "Booked Events" tab
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("bookings")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(bookings);
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/:id — Get a specific booking
// ---------------------------------------------------------------------------
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("bookings").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const data = doc.data();
    // Only allow the booking owner to view it
    if (data.userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    return res.json({ id: doc.id, ...data });
  } catch (err) {
    console.error("GET /api/bookings/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch booking" });
  }
});

module.exports = router;
