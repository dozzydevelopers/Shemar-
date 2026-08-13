#!/bin/bash
# Shemar Chat - Android Release Build Script
# Generates ShemarChat.apk and ShemarChat.aab

set -e

echo "=========================================="
echo " Building Shemar Chat Android Applications "
echo " Package ID: com.shemarchat.app"
echo "=========================================="

cd "$(dirname "$0")"

# Ensure gradlew executable if present
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    echo "[1/2] Building Android Release APK (ShemarChat.apk)..."
    ./gradlew assembleRelease

    echo "[2/2] Building Android Release App Bundle (ShemarChat.aab)..."
    ./gradlew bundleRelease
else
    echo "Notice: Gradle wrapper is configured. To build APK/AAB on an Android SDK host:"
    echo "Run: gradle assembleRelease bundleRelease"
fi

echo "=========================================="
echo " Android Build Configurations Ready! "
echo " APK target: android/app/build/outputs/apk/release/ShemarChat.apk"
echo " AAB target: android/app/build/outputs/bundle/release/ShemarChat.aab"
echo "=========================================="
