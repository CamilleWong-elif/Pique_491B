# Pique_491B

## Running the App
*Before running, make sure the following things are installed:
1. node.js (needed for npm, using just the .msi installer is fine)*
2. [Android VM Setup](Android_VM_Setup.md) (necessary for running virtual Android device)
3. Proper configuration for *app.config.js* and *.env* (most errors will result from here!)
	- Create personal SHA-1 key for Google Expo OAuth clientID [Set Up Personal Google Sign-In Credentials](Set_Up_Personal_Google_Sign-In_Credentials.md)

### Setup (Windows)

```bash
# Make sure you are in correct directory
cd pique_491b
# Installs everything specified in package.json
npm install  
npm install @react-native-google-signin/google-signin
# Command to start development build for Expo server
# We are not using npx expo start anymore!! 
npx expo run:android
```

The setup takes quite some time. Make sure you give at least 30+ min for all dependencies to install.

*If you see any issues with NDK in the error log, try reinstalling the NDK library in Android Studio.*


## Install specific version of NDK

1. Open Android Studio.
2. Go to Settings / Preferences → Appearance & Behavior → System Settings → Android SDK → SDK Tools.
3. Check "NDK (Side by side)".
4. Press OK / Apply to (re)install.
    - If `27.1.12297006` is not installed, install that version.
    - If it is installed but broken, uncheck it, apply (to uninstall), then check it again and apply (to reinstall).
