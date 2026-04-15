const express = require("express");
const { runTicketmasterIngestion } = require("./ingestion/ticketmaster");

const router = express.Router();

// Shared-secret auth. Header: x-ingestion-secret: <INGESTION_SECRET>
function requireIngestionSecret(req, res, next) {
  const provided = req.header("x-ingestion-secret");
  const expected = process.env.INGESTION_SECRET;
  if (!expected) {
    return res.status(500).json({ error: "INGESTION_SECRET not configured on server" });
  }
  if (provided !== expected) {
    return res.status(401).json({ error: "Invalid ingestion secret" });
  }
  next();
}

// POST /api/ingestion/run?source=ticketmaster[&maxPages=N]
// Manually trigger one or all ingestion adapters. Idempotent on reruns.
router.post("/run", requireIngestionSecret, async (req, res) => {
  const source = String(req.query.source || "all").toLowerCase();
  const maxPages = req.query.maxPages ? Number(req.query.maxPages) : undefined;
  const results = [];

  try {
    if (source === "ticketmaster" || source === "all") {
      const r = await runTicketmasterIngestion({ maxPages });
      results.push(r);
    }
    // Future: seatgeek, ical adapters slot in here.

    if (!results.length) {
      return res.status(400).json({ error: `Unknown source: ${source}` });
    }

    return res.json({ ok: true, results });
  } catch (err) {
    console.error("Ingestion run failed:", err);
    return res.status(500).json({ error: err.message || "Ingestion failed" });
  }
});

module.exports = router;
