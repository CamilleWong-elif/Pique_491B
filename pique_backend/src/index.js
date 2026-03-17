require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth");
const eventsRoutes = require("../routes/events");
const usersRoutes = require("../routes/users");
const reviewsRoutes = require("../routes/reviews");
const leaderboardRoutes = require("../routes/leaderboard");
const bookingsRoutes = require("../routes/bookings");
const messagesRoutes = require("../routes/messages");

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use("/api/auth", authRoutes);          // POST /api/auth/register
app.use("/api/events", eventsRoutes);      // CRUD events
app.use("/api/users", usersRoutes);        // User profiles
app.use("/api/reviews", reviewsRoutes);    // Reviews + friend reviews
app.use("/api/leaderboard", leaderboardRoutes); // Points leaderboard
app.use("/api/bookings", bookingsRoutes);  // Ticket bookings
app.use("/api/messages", messagesRoutes);  // Conversations + messages

// ── 404 catch-all ──
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
