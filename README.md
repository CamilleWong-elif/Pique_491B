# Pique_491B

## Running the App
*Before running, make sure node.js is installed (needed for npm, .msi installer is fine)*

### Everyone (except Camille)

```bash
cd pique_491b
npm install  # only needed the first time
npm install -g expo-cli  # For setting up local Expo server when testing on phone
npx expo start --tunnel
```
*Use --tunnel only if on public/school wifi (feature throttles performance slightly). "npx expo start" by itself is fine when testing on private network.*

### Camille (Mac)

```bash
cd pique_491b
npm install  # only needed the first time
chmod +x node_modules/.bin/expo
npx expo start --tunnel
```
