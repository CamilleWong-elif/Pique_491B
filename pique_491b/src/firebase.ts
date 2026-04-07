import { initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = Constants.expoConfig?.extra?.firebase as
  | {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    }
  | undefined;

if (!firebaseConfig?.apiKey) {
  throw new Error(
    "Missing Firebase config. Add FIREBASE_* vars to .env and ensure app.config.js loads them."
  );
}

if (!firebaseConfig?.storageBucket) {
  throw new Error(
    "Missing Firebase storage bucket. Set EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET in .env."
  );
}

const config = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

const app = initializeApp(config);

const getReactNativePersistence = (firebaseAuth as any)
  .getReactNativePersistence as undefined | ((storage: any) => any);

export const auth =
  Platform.OS === "web"
    ? firebaseAuth.getAuth(app)
    : getReactNativePersistence
      ? firebaseAuth.initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        })
      : firebaseAuth.getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
