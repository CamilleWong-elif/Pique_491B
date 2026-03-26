# Pique_491B

## Running the App
*Before running, make sure the following things are installed:
1. node.js (needed for npm, using just the .msi installer is fine)*
2. [Android VM Setup](Android%20VM%20Setup.md) (necessary for running virtual Android device)
3. Proper configuration for *app.config.js* and *.env* (most errors will result from here!)
	- Create personal SHA-1 key for Google Expo OAuth clientID [Set Up Personal Google Sign-In Credentials](Set%20Up%20Personal%20Google%20Sign-In%20Credentials.md)

### Setup (Windows)
1. Open two separate console windows (One for Expo and One for backend server)
2. Run these commands on Backend terminal:
```bash
# Change to backend directory (from root repo folder)
cd pique_backend
# Install backend dependencies
npm install
# Start up backend server
npm start
```

3. Run these commands on Expo terminal:
```bash
# Make sure you are in correct directory (from root repo folder)
cd pique_491b
# Installs everything specified in package.json
npm install  
npm install @react-native-google-signin/google-signin
# Command to start development build for Expo server. We are not using npx expo start anymore!! 
npx expo run:android
```

*The last command takes quite some time to build. Give roughly 15-20 minutes for npx expo run:android to install the first time.*

#### Troubleshooting
*If you see any issues with NDK in the error log, try reinstalling the NDK library in Android Studio.*
*If you see a network request error in the error log, it is most likely EXPO_API_URL is not configured correctly. Double check with a teammate for your .env file.*

###### Install specific version of NDK

1. Open Android Studio.
2. Go to Settings / Preferences → Appearance & Behavior → System Settings → Android SDK → SDK Tools.
3. Check "NDK (Side by side)".
4. Press OK / Apply to (re)install.
    - If `27.1.12297006` is not installed, install that version.
    - If it is installed but broken, uncheck it, apply (to uninstall), then check it again and apply (to reinstall).

###### .env Checklist
Make sure you have these variables within your .env:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=
EXPO_PUBLIC_MICROSOFT_TENANT_ID=
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000"

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_TO=
WEB3_FORM_API_KEY=
```
