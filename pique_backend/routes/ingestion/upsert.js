const { db } = require("../../src/config/firebase");

// Writes an event to Firestore using externalId as the doc ID, so repeated
// ingestion runs are idempotent (same external event -> same Firestore doc).
// Returns { created, updated, skipped, id }.
async function upsertIngestedEvent(event) {
  if (!event?.externalId || !event?.source) {
    return { skipped: true, reason: "missing externalId or source" };
  }

  const docId = `${event.source}_${event.externalId}`;
  const ref = db.collection("events").doc(docId);
  const existing = await ref.get();
  const nowIso = new Date().toISOString();

  // Firestore rejects undefined values; replace them with null.
  const cleaned = {};
  for (const [k, v] of Object.entries(event)) {
    cleaned[k] = v === undefined ? null : v;
  }

  const payload = {
    ...cleaned,
    createdAt: existing.exists ? existing.data().createdAt || nowIso : nowIso,
    updatedAt: nowIso,
    createdBy: "ingestion",
  };

  await ref.set(payload, { merge: true });
  return {
    id: docId,
    created: !existing.exists,
    updated: existing.exists,
  };
}

module.exports = { upsertIngestedEvent };
