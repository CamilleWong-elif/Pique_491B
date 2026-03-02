Simulating Android VM with VS Code without needing to open Android Studio's UI:

### Step 1: Install Android Studio
Even though you'll work in VS Code, Android Studio is still required in the background because it installs the Android SDK which is what actually compiles and runs your app. Download it from developer.android.com/studio and run the installer with all default options.

### Step 2: Set Up Environment Variables for Android SDK
After Android Studio installs, you need to tell your system where the SDK lives. On Windows:

Open Start Menu and search for "Edit the system environment variables"
Click Environment Variables
Under User variables, click New and add:

Variable name: ANDROID_HOME
Variable value: C:\Users\YourUsername\AppData\Local\Android\Sdk


Find the Path variable, click Edit, then New, and add:

%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools


Click OK on everything and restart VS Code

Verify it worked by running this in your VS Code terminal:
adb --version
If it prints a version number, the SDK is correctly configured.

### Step 3: Create an Android Emulator
You do need to open Android Studio once to create a virtual device:

Open Android Studio
Click More Actions → Virtual Device Manager
Click Create Device
Select a phone — Pixel 7 is a good choice
Select a system image — download and select Android 14 (API 34)
Click Finish

After that you never need to open Android Studio again for normal development.

### Step 4: Install the Android Emulator Extension in VS Code
This lets you start and manage your emulator directly from VS Code:

Open VS Code Extensions (Ctrl+Shift+X)
Search for "Android iOS Emulator" by Diemas Michiels
Install it

Once installed you'll see a phone icon in your VS Code sidebar where you can start your emulator with one click.

### Step 5: Run Your App from VS Code Terminal
With your emulator running, go to your VS Code terminal and run:
npx expo run:android
This will compile the app and install it on your emulator automatically. The first run takes several minutes because it's doing a full native build — subsequent runs are much faster.

### Step 6: Daily Development Workflow
After the first build, your daily workflow entirely in VS Code becomes:

Start the emulator from the VS Code sidebar extension
Run npx expo start in the terminal
Press a in the terminal to open on Android
Edit code and save — the app hot reloads automatically

You only need to run npx expo run:android again if you install a new package that contains native code (like react-native-maps or expo-auth-session). For regular code changes npx expo start is enough.