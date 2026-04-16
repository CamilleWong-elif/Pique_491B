require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth");
const eventsRoutes = require("../routes/events");
const usersRoutes = require("../routes/users");
const reviewsRoutes = require("../routes/reviews");
const activitiesRoutes = require("../routes/activities");
const leaderboardRoutes = require("../routes/leaderboard");
const bookingsRoutes = require("../routes/bookings");
const messagesRoutes = require("../routes/messages");
const contactRoutes = require("../routes/contact");
const ingestionRoutes = require("../routes/ingestion");

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use("/api/auth", authRoutes);          // POST /api/auth/register
app.use("/api/events", eventsRoutes);      // CRUD events
app.use("/api/users", usersRoutes);        // User profiles
app.use("/api/reviews", reviewsRoutes);    // Reviews + friend reviews
app.use("/api/activities", activitiesRoutes); // Feed activities (interested + engagement)
app.use("/api/leaderboard", leaderboardRoutes); // Points leaderboard
app.use("/api/bookings", bookingsRoutes);  // Ticket bookings
app.use("/api/messages", messagesRoutes);  // Conversations + messages
app.use("/api/contact", contactRoutes);    // Contact form email
app.use("/contact", contactRoutes);        // Legacy/mobile fallback
app.use("/api/ingestion", ingestionRoutes); // Event ingestion (Ticketmaster, etc.)

// ── 404 catch-all ──
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request payload too large" });
  }
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Pending-deletion cleanup ──
// Runs once on startup then every 24 hours.
// Permanently removes accounts whose 30-day recovery window has expired.
async function runDeletionCleanup() {
  try {
    const { db } = require("../src/config/firebase");
    const { admin } = require("../src/config/firebase");
    const nodemailer = require("nodemailer");

    const now = new Date();
    const expired = await db
      .collection("pendingDeletion")
      .where("scheduledDeletionAt", "<=", now.toISOString())
      .get();

    if (expired.empty) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    for (const snap of expired.docs) {
      const uid = snap.id;
      const { email } = snap.data();
      try {
        // Delete Firestore user doc and the pending-deletion record
        await db.collection("users").doc(uid).delete();
        await snap.ref.delete();

        // Delete Firebase Auth account
        await admin.auth().deleteUser(uid);

        // Send final confirmation email
        if (email) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: "Your Pique account has been permanently deleted",
            text: [
              "Hi,",
              "",
              "Your Pique account and all remaining personal data have been permanently deleted as scheduled.",
              "This action cannot be undone.",
              "",
              "If you have any questions, contact us at piquecsulb@gmail.com.",
              "",
              "— The Pique Team",
            ].join("\n"),
            html: `
              <p>Hi,</p>
              <p>Your Pique account and all remaining personal data have been <strong>permanently deleted</strong> as scheduled.</p>
              <p>This action cannot be undone.</p>
              <p>If you have any questions, contact us at <a href="mailto:piquecsulb@gmail.com">piquecsulb@gmail.com</a>.</p>
              <p>— The Pique Team</p>
            `,
          });
        }

        console.log(`Permanently deleted expired account: ${uid}`);
      } catch (err) {
        console.error(`Failed to permanently delete account ${uid}:`, err);
      }
    }
  } catch (err) {
    console.error("runDeletionCleanup error:", err);
  }
}

runDeletionCleanup();
setInterval(runDeletionCleanup, 24 * 60 * 60 * 1000);
