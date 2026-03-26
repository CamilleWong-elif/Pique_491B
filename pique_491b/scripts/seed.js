/**
 * Firestore Database Seed Script
 * 
 * Run with: node scripts/seed.js
 * 
 * This script populates the Firestore database with mock data for:
 * - Events (concerts, sports, tech meetups, etc.)
 * - Users (with display names, bios, and locations)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, updateDoc, where } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
require('dotenv').config();

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock Events Data
const mockEvents = [
  // Long Beach Area Events

  {
    name: "Fake Long Beach Jazz Festival",
    description: "A beloved summer tradition featuring world-class jazz artists across multiple outdoor stages at Rainbow Lagoon Park.",
    location: "Rainbow Lagoon Park, Long Beach",
    address: "400 E Shoreline Dr",
    city: "Long Beach",
    state: "CA",
    lat: 33.7680,
    lng: -118.1900,
    date: "08/09/2026",
    startDate: "Aug 9, 2026",
    endDate: "Aug 10, 2026",
    imageUrl: "https://picsum.photos/seed/jazzlb1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_jazz1/200/200", userName: "Marcus T" },
      { url: "https://picsum.photos/seed/user_jazz2/200/200", userName: "Priya N" },
    ],
    categories: ["Music", "Entertainment"],
    category: "Music",
    ageRange: "Any",
    maxCapacity: 8000,
    ticketTiers: [
      { id: "t1", name: "General Admission", price: 45, quantity: 6000 },
      { id: "t2", name: "VIP Seating", price: 120, quantity: 800 },
    ],
    pricePoint: 2,
    rating: 4.8,
    reviewCount: 312,
    createdBy: "uid_organizer002",
    createdAt: "2026-02-10T09:00:00.000Z",
  },

  {
    name: "Fake Long Beach Grand Prix Watch Party",
    description: "Watch the Acura Grand Prix of Long Beach live from a premium fan zone with giant screens, food trucks, and pit lane access.",
    location: "Shoreline Drive Fan Zone",
    address: "300 E Shoreline Dr",
    city: "Long Beach",
    state: "CA",
    lat: 33.7665,
    lng: -118.1880,
    date: "04/10/2026",
    startDate: "Apr 10, 2026",
    endDate: "Apr 12, 2026",
    imageUrl: "https://picsum.photos/seed/grandprix1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_gp1/200/200", userName: "Derek F" },
      { url: "https://picsum.photos/seed/user_gp2/200/200", userName: "Lisa C" },
    ],
    categories: ["Sports", "Entertainment"],
    category: "Sports",
    ageRange: "Any",
    maxCapacity: 12000,
    ticketTiers: [
      { id: "t1", name: "Fan Zone Pass", price: 60, quantity: 8000 },
      { id: "t2", name: "Pit Lane Experience", price: 250, quantity: 200 },
    ],
    pricePoint: 3,
    rating: 4.6,
    reviewCount: 189,
    createdBy: "uid_organizer003",
    createdAt: "2026-01-15T08:00:00.000Z",
  },

  {
    name: "Fake SoCal Outdoor Movie Night",
    description: "Classic films under the stars at Bluff Park with lawn seating, craft cocktails, and a pre-show DJ set overlooking the Pacific.",
    location: "Bluff Park Overlook",
    address: "4900 Ocean Blvd",
    city: "Long Beach",
    state: "CA",
    lat: 33.7520,
    lng: -118.1360,
    date: "06/20/2026",
    startDate: "Jun 20, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/movienight1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_movie1/200/200", userName: "Chloe W" },
    ],
    categories: ["Arts", "Entertainment"],
    category: "Arts",
    ageRange: "Any",
    maxCapacity: 500,
    ticketTiers: [
      { id: "t1", name: "Lawn Admission", price: 18, quantity: 400 },
      { id: "t2", name: "Premium Blanket Spot", price: 35, quantity: 100 },
    ],
    pricePoint: 1,
    rating: 4.5,
    reviewCount: 78,
    createdBy: "uid_organizer004",
    createdAt: "2026-02-28T14:00:00.000Z",
  },

  {
    name: "Fake Long Beach Tech Summit",
    description: "A full-day conference bringing together startup founders, engineers, and investors from the greater LA tech scene. Keynotes, workshops, and networking.",
    location: "Long Beach Convention Center",
    address: "300 E Ocean Blvd",
    city: "Long Beach",
    state: "CA",
    lat: 33.7694,
    lng: -118.1899,
    date: "05/14/2026",
    startDate: "May 14, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/techsummit1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_tech1/200/200", userName: "Jordan K" },
      { url: "https://picsum.photos/seed/user_tech2/200/200", userName: "Aisha R" },
      { url: "https://picsum.photos/seed/user_tech3/200/200", userName: "Brian L" },
    ],
    categories: ["Tech", "Networking"],
    category: "Tech",
    ageRange: "18+",
    maxCapacity: 1500,
    ticketTiers: [
      { id: "t1", name: "General Attendee", price: 99, quantity: 1200 },
      { id: "t2", name: "VIP All-Access", price: 249, quantity: 200 },
      { id: "t3", name: "Student Pass", price: 29, quantity: 100 },
    ],
    pricePoint: 3,
    rating: 4.4,
    reviewCount: 55,
    createdBy: "uid_organizer005",
    createdAt: "2026-02-01T10:00:00.000Z",
  },

  {
    name: "Fake Belmont Shore 5K Beach Run",
    description: "Lace up and hit the sand! This community 5K starts at Belmont Pier and winds through the beach path. All skill levels welcome — finisher medals for everyone.",
    location: "Belmont Pier",
    address: "39 39th Pl",
    city: "Long Beach",
    state: "CA",
    lat: 33.7503,
    lng: -118.1333,
    date: "03/29/2026",
    startDate: "Mar 29, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/beachrun1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_run1/200/200", userName: "Tanya M" },
      { url: "https://picsum.photos/seed/user_run2/200/200", userName: "Sam P" },
    ],
    categories: ["Sports", "Outdoors"],
    category: "Sports",
    ageRange: "Any",
    maxCapacity: 600,
    ticketTiers: [
      { id: "t1", name: "Race Entry", price: 30, quantity: 600 },
    ],
    pricePoint: 1,
    rating: 4.9,
    reviewCount: 143,
    createdBy: "uid_organizer006",
    createdAt: "2026-01-05T07:00:00.000Z",
  },

  {
    name: "Fake El Dorado Nature Center Hike & Paint",
    description: "Guided nature hike through El Dorado Park followed by a watercolor paint session inspired by the local flora and wildlife. All supplies included.",
    location: "El Dorado Nature Center",
    address: "7550 E Spring St",
    city: "Long Beach",
    state: "CA",
    lat: 33.8000,
    lng: -118.0940,
    date: "04/25/2026",
    startDate: "Apr 25, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/hikepaint1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_hike1/200/200", userName: "Nina G" },
    ],
    categories: ["Outdoors", "Arts"],
    category: "Outdoors",
    ageRange: "Any",
    maxCapacity: 40,
    ticketTiers: [
      { id: "t1", name: "All-Inclusive Spot", price: 55, quantity: 40 },
    ],
    pricePoint: 2,
    rating: 4.7,
    reviewCount: 22,
    createdBy: "uid_organizer007",
    createdAt: "2026-03-01T11:00:00.000Z",
  },

  {
    name: "Fake Aquarium of the Pacific Night Lights",
    description: "After-hours glow experience at the Aquarium of the Pacific with bioluminescent jellyfish exhibits, live music, and craft beer pairings.",
    location: "Aquarium of the Pacific",
    address: "100 Aquarium Way",
    city: "Long Beach",
    state: "CA",
    lat: 33.7633,
    lng: -118.1969,
    date: "07/03/2026",
    startDate: "Jul 3, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/aquarium1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_aqua1/200/200", userName: "Felix O" },
      { url: "https://picsum.photos/seed/user_aqua2/200/200", userName: "Maya S" },
    ],
    categories: ["Arts", "Entertainment"],
    category: "Arts",
    ageRange: "21+",
    maxCapacity: 800,
    ticketTiers: [
      { id: "t1", name: "General Entry", price: 40, quantity: 600 },
      { id: "t2", name: "Premium Pairing Package", price: 80, quantity: 200 },
    ],
    pricePoint: 2,
    rating: 4.6,
    reviewCount: 97,
    createdBy: "uid_organizer008",
    createdAt: "2026-02-14T09:30:00.000Z",
  },

  {
    name: "Fake Pike Outlets Summer Block Party",
    description: "Free outdoor block party at The Pike with live bands, local vendor pop-ups, food trucks, and family-friendly activities all day long.",
    location: "The Pike Outlets",
    address: "95 S Pine Ave",
    city: "Long Beach",
    state: "CA",
    lat: 33.7647,
    lng: -118.1941,
    date: "06/06/2026",
    startDate: "Jun 6, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/blockparty1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_block1/200/200", userName: "Rosa V" },
      { url: "https://picsum.photos/seed/user_block2/200/200", userName: "Cam D" },
    ],
    categories: ["Music", "Entertainment"],
    category: "Music",
    ageRange: "Any",
    maxCapacity: 3000,
    ticketTiers: [
      { id: "t1", name: "Free Entry", price: 0, quantity: 3000 },
    ],
    pricePoint: 0,
    rating: 4.3,
    reviewCount: 64,
    createdBy: "uid_organizer009",
    createdAt: "2026-03-05T08:00:00.000Z",
  },

  {
    name: "Fake Naples Canal Sunset Kayak Tour",
    description: "Guided sunset paddle through the Naples canals with live acoustic music at the dock and hot cocoa after the tour.",
    location: "Alamitos Bay Marina",
    address: "205 N Marina Dr",
    city: "Long Beach",
    state: "CA",
    lat: 33.7592,
    lng: -118.1368,
    date: "09/12/2026",
    startDate: "Sep 12, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/kayaklb1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_kayak1/200/200", userName: "Olivia P" },
      { url: "https://picsum.photos/seed/user_kayak2/200/200", userName: "Noah E" },
    ],
    categories: ["Outdoors", "Sports"],
    category: "Outdoors",
    ageRange: "Any",
    maxCapacity: 120,
    ticketTiers: [
      { id: "t1", name: "Single Kayak", price: 45, quantity: 80 },
      { id: "t2", name: "Tandem Kayak", price: 70, quantity: 20 },
    ],
    pricePoint: 2,
    rating: 4.8,
    reviewCount: 111,
    createdBy: "uid_organizer010",
    createdAt: "2026-03-10T10:15:00.000Z",
  },

  {
    name: "Fake Bixby Knolls Food & Art Walk",
    description: "Neighborhood crawl featuring local chefs, pop-up galleries, and live mural painting across Atlantic Avenue.",
    location: "Bixby Knolls",
    address: "4321 Atlantic Ave",
    city: "Long Beach",
    state: "CA",
    lat: 33.8370,
    lng: -118.1852,
    date: "10/03/2026",
    startDate: "Oct 3, 2026",
    endDate: undefined,
    imageUrl: "https://picsum.photos/seed/bixbywalk1/400/300",
    userImages: [
      { url: "https://picsum.photos/seed/user_bixby1/200/200", userName: "Hannah Q" },
      { url: "https://picsum.photos/seed/user_bixby2/200/200", userName: "Evan R" },
    ],
    categories: ["Arts", "Entertainment"],
    category: "Arts",
    ageRange: "Any",
    maxCapacity: 2000,
    ticketTiers: [
      { id: "t1", name: "General Entry", price: 20, quantity: 1800 },
      { id: "t2", name: "VIP Tasting Pass", price: 55, quantity: 200 },
    ],
    pricePoint: 1,
    rating: 4.5,
    reviewCount: 86,
    createdBy: "uid_organizer011",
    createdAt: "2026-03-11T16:20:00.000Z",
  },
];

function removeUndefinedValues(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedValues(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const cleaned = removeUndefinedValues(nestedValue);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result;
  }

  return value === undefined ? undefined : value;
}


// Seed Functions
async function seedEvents() {
  console.log('🌱 Seeding events...');
  const eventsRef = collection(db, 'events');
  
  for (const event of mockEvents) {
    try {
      const basePayload = removeUndefinedValues({
        ...event,
        updatedAt: new Date(),
      });

      const existingDocs = await getDocs(query(eventsRef, where('name', '==', event.name)));

      if (!existingDocs.empty) {
        const { createdAt: _ignoredCreatedAt, ...updatePayload } = basePayload;
        for (const existingDoc of existingDocs.docs) {
          await updateDoc(existingDoc.ref, updatePayload);
        }
        console.log(`♻️ Updated event: ${event.name} (${existingDocs.size} match${existingDocs.size === 1 ? '' : 'es'})`);
        continue;
      }

      const payload = {
        ...basePayload,
        createdAt: new Date(),
      };

      const docRef = await addDoc(eventsRef, payload);
      console.log(`✅ Added event: ${event.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding event ${event.name}:`, error.message);
    }
  }
  
  console.log(`\n✨ Successfully seeded ${mockEvents.length} events!\n`);
}

// Run the seeding function
seedEvents().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

