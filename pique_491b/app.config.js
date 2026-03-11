require("dotenv").config();

module.exports = {
  expo: {
    name: "PiqueApp",
    slug: "piqueapp",
    owner: "camyw",
    scheme: "piqueapp",
    platforms: ["android", "ios"],
    android: {
      package: "com.piqueapp.main",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/temp_logo.png",
        backgroundColor: "#2E96F0",
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      bundleIdentifier: "com.piqueapp.main",
    },
    // ─── ADD THIS PLUGINS ARRAY ───
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
        },
      ],
    ],
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
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      },
    },
  },
};