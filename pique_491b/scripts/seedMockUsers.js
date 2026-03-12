/**
 * Run from the pique_491b directory:
 *   node scripts/seedMockUsers.js
 */

require("dotenv").config();
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

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

const mockUsers = [
  {
    uid: "uid_alex",
    displayName: "Alex Rivera",
    username: "alex_rivera",
    email: "alex@example.com",
    bio: "Event enthusiast 🌟 | Always down for something new",
    avatar: "https://i.pravatar.cc/150?img=1",
    dateOfBirth: "1999-04-08",
    privateAccount: false,
    points: 120,
    followerCount: ["uid_maya", "uid_jordan", "uid_sam", "uid_priya", "uid_zoe"],
    followingCount: ["uid_maya", "uid_jordan", "uid_sam", "uid_priya"],
    lat: 33.8366,
    lng: -118.3257,
    createdAt: "2025-01-10T09:00:00.000Z",
  },
  {
    uid: "uid_maya",
    displayName: "Maya Chen",
    username: "maya_chen",
    email: "maya@example.com",
    bio: "Foodie & concert lover 🎶",
    avatar: "https://i.pravatar.cc/150?img=5",
    dateOfBirth: "2000-07-22",
    privateAccount: false,
    points: 85,
    followerCount: ["uid_alex", "uid_jordan", "uid_kai", "uid_sofia"],
    followingCount: ["uid_alex", "uid_jordan", "uid_kai", "uid_sofia"],
    lat: 34.0195,
    lng: -118.4912,
    createdAt: "2025-01-12T10:30:00.000Z",
  },
  {
    uid: "uid_jordan",
    displayName: "Jordan Lee",
    username: "jordan_lee",
    email: "jordan@example.com",
    bio: "Sports fan & weekend adventurer ⛰️",
    avatar: "https://i.pravatar.cc/150?img=12",
    dateOfBirth: "1998-11-15",
    privateAccount: false,
    points: 60,
    followerCount: ["uid_alex", "uid_maya"],
    followingCount: ["uid_alex", "uid_maya", "uid_ethan", "uid_zoe"],
    lat: 34.0522,
    lng: -118.2437,
    createdAt: "2025-01-14T08:15:00.000Z",
  },
  {
    uid: "uid_sam",
    displayName: "Sam Torres",
    username: "sam_torres",
    email: "sam@example.com",
    bio: "Local event finder 📍",
    avatar: "https://i.pravatar.cc/150?img=17",
    dateOfBirth: "2001-03-30",
    privateAccount: true,
    points: 40,
    followerCount: ["uid_alex", "uid_marcus"],
    followingCount: ["uid_alex", "uid_priya", "uid_marcus"],
    lat: 33.9425,
    lng: -118.4081,
    createdAt: "2025-01-20T12:00:00.000Z",
  },
  {
    uid: "uid_priya",
    displayName: "Priya Patel",
    username: "priya_patel",
    email: "priya@example.com",
    bio: "Art shows & rooftop bars ✨",
    avatar: "https://i.pravatar.cc/150?img=23",
    dateOfBirth: "2000-09-05",
    privateAccount: false,
    points: 95,
    followerCount: ["uid_alex", "uid_sam", "uid_kai"],
    followingCount: ["uid_sam", "uid_alex", "uid_kai", "uid_sofia"],
    lat: 34.0736,
    lng: -118.4004,
    createdAt: "2025-01-22T11:45:00.000Z",
  },
  {
    uid: "uid_kai",
    displayName: "Kai Nakamura",
    username: "kai_nakamura",
    email: "kai@example.com",
    bio: "Night market regular 🌮🎡",
    avatar: "https://i.pravatar.cc/150?img=33",
    dateOfBirth: "1997-06-18",
    privateAccount: false,
    points: 150,
    followerCount: ["uid_maya", "uid_priya", "uid_zoe"],
    followingCount: ["uid_maya", "uid_priya", "uid_zoe", "uid_marcus"],
    lat: 34.1478,
    lng: -118.1445,
    createdAt: "2025-02-01T07:30:00.000Z",
  },
  {
    uid: "uid_sofia",
    displayName: "Sofia Reyes",
    username: "sofia_reyes",
    email: "sofia@example.com",
    bio: "Gallery hopper & brunch queen 🥂",
    avatar: "https://i.pravatar.cc/150?img=44",
    dateOfBirth: "2001-01-25",
    privateAccount: false,
    points: 30,
    followerCount: ["uid_maya", "uid_priya", "uid_ethan"],
    followingCount: ["uid_maya", "uid_priya", "uid_ethan"],
    lat: 34.0089,
    lng: -118.4975,
    createdAt: "2025-02-05T14:00:00.000Z",
  },
  {
    uid: "uid_ethan",
    displayName: "Ethan Brooks",
    username: "ethan_brooks",
    email: "ethan@example.com",
    bio: "Sneakerhead & pop-up shop tracker 👟",
    avatar: "https://i.pravatar.cc/150?img=52",
    dateOfBirth: "1999-12-03",
    privateAccount: false,
    points: 75,
    followerCount: ["uid_jordan", "uid_sofia", "uid_marcus", "uid_zoe"],
    followingCount: ["uid_jordan", "uid_sofia", "uid_marcus", "uid_zoe"],
    lat: 34.0259,
    lng: -118.2970,
    createdAt: "2025-02-10T09:20:00.000Z",
  },
  {
    uid: "uid_zoe",
    displayName: "Zoe Williams",
    username: "zoe_williams",
    email: "zoe@example.com",
    bio: "Festival season never ends 🎪",
    avatar: "https://i.pravatar.cc/150?img=61",
    dateOfBirth: "2002-05-14",
    privateAccount: false,
    points: 55,
    followerCount: ["uid_jordan", "uid_kai", "uid_ethan"],
    followingCount: ["uid_jordan", "uid_kai", "uid_ethan", "uid_alex"],
    lat: 34.1700,
    lng: -118.3765,
    createdAt: "2025-02-15T16:45:00.000Z",
  },
  {
    uid: "uid_marcus",
    displayName: "Marcus Johnson",
    username: "marcus_johnson",
    email: "marcus@example.com",
    bio: "Sports events & live comedy 🎤",
    avatar: "https://i.pravatar.cc/150?img=68",
    dateOfBirth: "1996-08-27",
    privateAccount: true,
    points: 200,
    followerCount: ["uid_sam", "uid_kai"],
    followingCount: ["uid_sam", "uid_kai", "uid_ethan"],
    lat: 33.8958,
    lng: -118.2201,
    createdAt: "2025-02-20T13:10:00.000Z",
  },
];

async function seed() {
  console.log(`Seeding ${mockUsers.length} users to Firestore project: ${firebaseConfig.projectId}\n`);

  for (const user of mockUsers) {
    const { uid, ...data } = user;
    await setDoc(doc(db, "users", uid), data);
    console.log(`✓ ${uid} (${data.displayName})`);
  }

  console.log("\nDone! All mock users written to Firestore.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
