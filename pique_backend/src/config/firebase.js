const admin = require("firebase-admin");
const path = require("path");

function initializeFirebase() {
  // Option A: service account JSON file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(
      path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  // Option B: individual env vars
  else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID in .env"
    );
  }

  return admin.firestore();
}

const db = initializeFirebase();

module.exports = { admin, db };
