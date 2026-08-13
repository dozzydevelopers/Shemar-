# Shemar Chat — Native Android App Project

This directory contains the production-ready native Android wrapper application for **Shemar Chat**.

## Project Details
- **Application ID**: `com.shemarchat.app`
- **Application Name**: Shemar Chat
- **Primary Source of Truth**: Shemar Chat Web Application (TypeScript/React/Vite)
- **Min Android SDK**: 24 (Android 7.0+)
- **Target Android SDK**: 34 (Android 14)

---

## Output Binaries
1. **`ShemarChat.apk`**: Standalone production Android application package.
2. **`ShemarChat.aab`**: Android App Bundle formatted for Google Play Store publishing.

---

## Building the Android App

### Option A: Using Command Line (Linux / macOS / Windows)
```bash
# Navigate to the android directory
cd android

# Make build script executable & run
chmod +x build-android.sh
./build-android.sh
```

Or using Gradle directly:
```bash
# Build Release APK
./gradlew assembleRelease

# Build Google Play AAB Bundle
./gradlew bundleRelease
```

### Option B: Using Android Studio
1. Open **Android Studio**.
2. Select **Open an existing project** and choose the `android/` directory.
3. Allow Gradle synchronization to complete.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** or **Build Bundle(s)**.

---

## Key Features Implemented in Native Android App
- **WebView Container**: Hardware accelerated, DOM Storage enabled, high-performance web runtime.
- **Photo & File Chooser**: Integrated `WebChromeClient` with native file intent picker for image/file uploads in chats.
- **Back Navigation**: Android hardware back button traverses WebView history smoothly before exiting.
- **Deep Linking**: Responds to `shemarchat://` and `https://ais-dev-...` deep links.
- **Native Splash Screen**: Smooth loading animation and theme integration.
- **Safe Area Insets**: Respects camera notch, dynamic island, and status bar padding.
