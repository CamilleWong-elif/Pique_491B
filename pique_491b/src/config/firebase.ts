import { initializeApp } from "firebase/app";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
=======
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
>>>>>>> 70a0f7ca1242574d8a218f3c9b05cc02329ce645

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
<<<<<<< HEAD
=======

>>>>>>> 70a0f7ca1242574d8a218f3c9b05cc02329ce645
export default app;
