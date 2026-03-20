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
        foregroundImage: "./src/assets/images/icon.png",
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
      icon: { foregroundImage: "./src/assets/images/icon.png" },
      backgroundColor: "#2E96F0",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera."
        }
      ],
    ],
    extra: {
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      googleAuth: {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      },
      microsoftAuth: {
        clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
        tenantId: process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID,
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};