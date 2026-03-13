```bash
# Create .android directory if not already created from Android Studio installation
mkdir %USERPROFILE%/.android

# Generate debug keystore
keytool -genkey -v -keystore ~/.android/debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"

# Get your SHA-1 key
keytool -list -v -keystore android/app/debug.keystore -storepass android 2>/dev/null || keytool -list -v -keystore ~/.android/debug.keystore -storepass android
```
- Each block is one entire command statement


*If keytool command isn't recognized on your terminal, **make sure JDK 17 is installed**. Use the following command to install the feature:*
```bash
winget install EclipseAdoptium.Temurin.17.JDK
```


Next, go to console.cloud.google.com using our piquecsulb gmail account.

###### Create Android OAuth client ID
1.  console.cloud.google.com → APIs & Services → Credentials
2. CREATE CREDENTIALS → OAuth client ID → Android)
3. Package name: com.piqueapp.main
4. SHA-1 certificate fingerprint: **Enter your generated SHA1 key here.**
5. Save

###### Create Web OAuth client ID (Optional)
1. CREATE CREDENTIALS -> OAuth client ID -> Web client
2. Add your redirect URL. it should be in the format of: `https://auth.expo.io/@yourexpousername/piqueapp`