import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

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

const config = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

const app = initializeApp(config);

export const auth = getAuth(app);
export default app;