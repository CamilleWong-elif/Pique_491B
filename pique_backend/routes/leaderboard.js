const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/** UIDs where both users follow each other (uses `followingCount` arrays on user docs). */
async function getMutualFriendIds(viewerUid) {
  const viewerDoc = await db.collection("users").doc(viewerUid).get();
  if (!viewerDoc.exists) return [];
  const raw = viewerDoc.data().followingCount;
  const followingIds = Array.isArray(raw)
    ? raw.filter((id) => typeof id === "string" && id.trim().length > 0 && id !== viewerUid)
    : [];

  const mutual = [];
  for (let i = 0; i < followingIds.length; i += 30) {
    const batch = followingIds.slice(i, i + 30);
    const snap = await db.collection("users").where("__name__", "in", batch).get();
    snap.docs.forEach((doc) => {
      const theirFollowing = doc.data().followingCount;
      if (Array.isArray(theirFollowing) && theirFollowing.includes(viewerUid)) {
        mutual.push(doc.id);
      }
    });
  }
  return mutual;
}

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
      const mutualIds = await getMutualFriendIds(req.user.uid);
      const friendIds = Array.from(new Set([...mutualIds, req.user.uid]));

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
        avatar: doc.data().avatarDataUrl || doc.data().avatar || doc.data().photoURL || null,
        points: doc.data().points || 0,
      }));
    } else {
      const snapshot = await db
        .collection("users")
        .orderBy("points", "desc")
        .limit(50)
        .get();

      const uid = req.user.uid;
      users = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().displayName || "Unknown",
        avatar: doc.data().avatarDataUrl || doc.data().avatar || doc.data().photoURL || null,
        points: doc.data().points || 0,
      }));

      const inTop = users.some((u) => u.id === uid);
      if (!inTop) {
        const selfDoc = await db.collection("users").doc(uid).get();
        if (selfDoc.exists) {
          const d = selfDoc.data();
          users.push({
            id: selfDoc.id,
            name: d.displayName || "Unknown",
            avatar: d.avatarDataUrl || d.avatar || d.photoURL || null,
            points: d.points || 0,
          });
        }
      }
    }

    users.sort((a, b) => b.points - a.points);

    return res.json(users);
  } catch (err) {
    console.error("GET /api/leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
