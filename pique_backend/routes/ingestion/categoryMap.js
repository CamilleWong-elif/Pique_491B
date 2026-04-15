// Pique's 18 categories (must stay in sync with HomePage.tsx / CreateEventPage.tsx)
const PIQUE_CATEGORIES = [
  "Arts", "Business", "Comedy", "Education", "Family", "Fashion",
  "Film", "Fitness", "Food & Drink", "Gaming", "Health & Wellness",
  "Music", "Nightlife", "Outdoors", "Sports", "Tech", "Theater", "Travel",
];

// Ticketmaster uses segment/genre/subGenre. Segment is the top-level bucket.
const TICKETMASTER_SEGMENT_MAP = {
  "Music": ["Music"],
  "Sports": ["Sports"],
  "Arts & Theatre": ["Theater", "Arts"],
  "Film": ["Film"],
  "Miscellaneous": [],
  "Family": ["Family"],
};

// Genre gives us finer-grained hints when segment is ambiguous.
const TICKETMASTER_GENRE_HINTS = {
  "Comedy": "Comedy",
  "Classical": "Music",
  "Dance": "Arts",
  "Fine Art": "Arts",
  "Theatre": "Theater",
  "Musical": "Theater",
  "Food & Drink": "Food & Drink",
  "Fashion": "Fashion",
  "Lectures & Seminars": "Education",
  "Fitness": "Fitness",
  "Health": "Health & Wellness",
};

function mapTicketmasterClassifications(classifications = []) {
  const categories = new Set();
  for (const c of classifications) {
    const segment = c?.segment?.name;
    const genre = c?.genre?.name;
    const subGenre = c?.subGenre?.name;

    if (genre && TICKETMASTER_GENRE_HINTS[genre]) {
      categories.add(TICKETMASTER_GENRE_HINTS[genre]);
    }
    if (subGenre && TICKETMASTER_GENRE_HINTS[subGenre]) {
      categories.add(TICKETMASTER_GENRE_HINTS[subGenre]);
    }
    if (segment && TICKETMASTER_SEGMENT_MAP[segment]) {
      for (const piqueCat of TICKETMASTER_SEGMENT_MAP[segment]) {
        categories.add(piqueCat);
      }
    }
  }
  return Array.from(categories).slice(0, 3);
}

module.exports = {
  PIQUE_CATEGORIES,
  mapTicketmasterClassifications,
};
