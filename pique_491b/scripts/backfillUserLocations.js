/**
 * Run from the pique_491b directory:
 *   node scripts/backfillUserLocations.js
 *
 * Fills in missing user lat/lng values with randomized coordinates
 * within Southern California bounds.
 */

require("dotenv").config();
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const isDryRun = process.argv.includes("--dry-run");

const TARGET_AREAS = [
  {
    name: "Los Angeles",
    county: "Los Angeles County",
    weight: 0.5,
    minLat: 33.90,
    maxLat: 34.15,
    minLng: -118.52,
    maxLng: -118.15,
  },
  {
    name: "Pasadena",
    county: "Los Angeles County",
    weight: 0.2,
    minLat: 34.11,
    maxLat: 34.20,
    minLng: -118.20,
    maxLng: -118.10,
  },
  {
    name: "Long Beach",
    county: "Los Angeles County",
    weight: 0.3,
    minLat: 33.73,
    maxLat: 33.88,
    minLng: -118.24,
    maxLng: -118.12,
  },
];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function pickTargetArea() {
  const random = Math.random();
  let cumulative = 0;

  for (const area of TARGET_AREAS) {
    cumulative += area.weight;
    if (random <= cumulative) {
      return area;
    }
  }

  return TARGET_AREAS[TARGET_AREAS.length - 1];
}

function generateTargetAreaCoordinates() {
  const area = pickTargetArea();
  return {
    areaName: area.name,
    countyName: area.county,
    lat: Number(randomInRange(area.minLat, area.maxLat).toFixed(6)),
    lng: Number(randomInRange(area.minLng, area.maxLng).toFixed(6)),
  };
}

async function backfillMissingUserLocations() {
  console.log(`Scanning users in Firestore project: ${firebaseConfig.projectId}`);
  if (isDryRun) {
    console.log("Dry run enabled: no changes will be written.");
  }
  console.log("");

  const usersSnapshot = await getDocs(collection(db, "users"));

  if (usersSnapshot.empty) {
    console.log("No users found. Nothing to update.");
    process.exit(0);
  }

  let updatedCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const { areaName, countyName, lat, lng } = generateTargetAreaCoordinates();
    if (isDryRun) {
      console.log(`Would update ${userDoc.id}: area=${areaName}, county=${countyName}, lat=${lat}, lng=${lng}`);
      updatedCount += 1;
      continue;
    }

    await updateDoc(doc(db, "users", userDoc.id), { lat, lng });
    updatedCount += 1;
    console.log(`Updated ${userDoc.id}: area=${areaName}, county=${countyName}, lat=${lat}, lng=${lng}`);
  }

  console.log(isDryRun ? "\nDry run complete." : "\nBackfill complete.");
  console.log(isDryRun ? `Users that would be updated: ${updatedCount}` : `Updated users: ${updatedCount}`);
  process.exit(0);
}

backfillMissingUserLocations().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
