require("dotenv").config();

module.exports = {
  expo: {
    name: "PiqueApp",
    slug: "piqueapp",
    scheme: "piqueapp",
    platforms: ["android", "ios"],
    android: {
      package: "com.piqueapp.main",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/temp_logo.png",
        backgroundColor: "#2E96F0"
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    ios: {
      bundleIdentifier: "com.piqueapp.main",
    },
    extra: {
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
      googleAuth: {
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      },
    },
  },
};
