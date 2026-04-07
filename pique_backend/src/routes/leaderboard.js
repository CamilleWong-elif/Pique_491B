const express = require("express");
const { db } = require("../config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/leaderboard?mode=friends|global
// Returns users ranked by activity points.
// Replaces mock leaderboard data in CommunityPage.tsx
// ---------------------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const mode = req.query.mode || "friends";

    let users;

    if (mode === "friends") {
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const friendIds = [...(userData.followingCount || [])];
      // Include current user in friends leaderboard
      friendIds.push(req.user.uid);

      if (friendIds.length === 0) {
        return res.json([]);
      }

      const batches = [];
      for (let i = 0; i < friendIds.length; i += 30) {
        const batch = friendIds.slice(i, i + 30);
        const snap = await db
          .collection("users")
          .where("__name__", "in", batch)
          .get();
        batches.push(...snap.docs);
      }

      users = batches.map((doc) => ({
        id: doc.id,
        name: doc.data().displayName || "Unknown",
        avatar: doc.data().avatar || null,
        points: doc.data().points || 0,
      }));
    } else {
      const snapshot = await db
        .collection("users")
        .orderBy("points", "desc")
        .limit(50)
        .get();

      users = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().displayName || "Unknown",
        avatar: doc.data().avatar || null,
        points: doc.data().points || 0,
      }));
    }

    users.sort((a, b) => b.points - a.points);

    return res.json(users);
  } catch (err) {
    console.error("GET /api/leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
