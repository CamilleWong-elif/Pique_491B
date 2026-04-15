const { mapTicketmasterClassifications } = require("./categoryMap");
const { upsertIngestedEvent } = require("./upsert");

const TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json";

// Long Beach center. 50-mile radius covers most of LA metro.
const DEFAULT_LAT = 33.7701;
const DEFAULT_LNG = -118.1937;
const DEFAULT_RADIUS_MILES = 50;
const MIN_START = "2026-01-01T00:00:00Z";
const PAGE_SIZE = 100;
const MAX_PAGES = 10;

function pickBestImage(images = []) {
  if (!images.length) return null;
  const wide = images.filter((i) => i.ratio === "16_9");
  const pool = wide.length ? wide : images;
  return pool.reduce((best, cur) => (cur.width > (best?.width || 0) ? cur : best), null)?.url || null;
}

// Ticketmaster's priceRanges are USD min/max. Bucket min -> Pique's 0-3 pricePoint.
function priceToBucket(priceRanges) {
  const min = priceRanges?.[0]?.min;
  if (typeof min !== "number") return null;
  if (min === 0) return 0;
  if (min < 25) return 1;
  if (min < 75) return 2;
  return 3;
}

function mapTicketmasterEvent(tmEvent) {
  const venue = tmEvent?._embedded?.venues?.[0];
  const startDateTime = tmEvent?.dates?.start?.dateTime || tmEvent?.dates?.start?.localDate;
  const endDateTime = tmEvent?.dates?.end?.dateTime || tmEvent?.dates?.end?.localDate;

  const categories = mapTicketmasterClassifications(tmEvent?.classifications);
  const imageUrl = pickBestImage(tmEvent?.images);
  const pricePoint = priceToBucket(tmEvent?.priceRanges);

  const latStr = venue?.location?.latitude;
  const lngStr = venue?.location?.longitude;
  const lat = latStr ? Number(latStr) : undefined;
  const lng = lngStr ? Number(lngStr) : undefined;

  const description = tmEvent?.info || tmEvent?.pleaseNote || tmEvent?.description || "";

  const event = {
    source: "ticketmaster",
    externalId: tmEvent.id,
    externalUrl: tmEvent.url || null,
    name: tmEvent.name || "Untitled Event",
    description,
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    startDate: startDateTime || null,
    endDate: endDateTime || null,
    date: startDateTime || null,
    location: venue?.name || "",
    address: venue?.address?.line1 || "",
    city: venue?.city?.name || "",
    state: venue?.state?.stateCode || venue?.state?.name || "",
    country: venue?.country?.countryCode || "",
    category: categories[0] || null,
    categories,
    pricePoint,
    ageRange: "Any",
    ticketTiers: [],
    maxCapacity: null,
  };

  event.lat = (lat !== undefined && !Number.isNaN(lat)) ? lat : null;
  event.lng = (lng !== undefined && !Number.isNaN(lng)) ? lng : null;

  return event;
}

async function fetchTicketmasterPage({ apiKey, lat, lng, radius, startDateTime, page }) {
  const params = new URLSearchParams({
    apikey: apiKey,
    latlong: `${lat},${lng}`,
    radius: String(radius),
    unit: "miles",
    startDateTime,
    size: String(PAGE_SIZE),
    page: String(page),
    sort: "date,asc",
    locale: "*",
  });
  const url = `${TM_BASE}?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Ticketmaster ${resp.status}: ${body.slice(0, 300)}`);
  }
  return resp.json();
}

// Runs ingestion. Options allow override for testing but defaults match Phase 1 plan.
async function runTicketmasterIngestion(options = {}) {
  const apiKey = options.apiKey || process.env.TM_CONSUMER_KEY;
  if (!apiKey) {
    throw new Error("TM_CONSUMER_KEY not set in environment");
  }

  const lat = options.lat ?? DEFAULT_LAT;
  const lng = options.lng ?? DEFAULT_LNG;
  const radius = options.radius ?? DEFAULT_RADIUS_MILES;
  const startDateTime = options.startDateTime || MIN_START;
  const maxPages = options.maxPages ?? MAX_PAGES;

  let page = 0;
  let totalFetched = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let totalPages = 0;

  while (page < maxPages) {
    const data = await fetchTicketmasterPage({
      apiKey, lat, lng, radius, startDateTime, page,
    });

    totalPages = data?.page?.totalPages || 0;
    const tmEvents = data?._embedded?.events || [];
    if (!tmEvents.length) break;

    for (const tmEvent of tmEvents) {
      totalFetched += 1;
      try {
        const mapped = mapTicketmasterEvent(tmEvent);
        const result = await upsertIngestedEvent(mapped);
        if (result.created) created += 1;
        else if (result.updated) updated += 1;
        else skipped += 1;
      } catch (err) {
        console.error("Failed to upsert TM event", tmEvent?.id, err.message);
        skipped += 1;
      }
    }

    page += 1;
    if (page >= totalPages) break;
  }

  return {
    source: "ticketmaster",
    totalFetched,
    created,
    updated,
    skipped,
    pagesProcessed: page,
    totalPagesAvailable: totalPages,
  };
}

module.exports = {
  runTicketmasterIngestion,
  mapTicketmasterEvent, // exported for future unit tests
};
