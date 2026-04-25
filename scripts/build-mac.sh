#!/bin/bash

# Marksmith macOS Build Script
# Builds the application locally for macOS (Apple Silicon)

echo "🚀 Building Marksmith for macOS..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out dist

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build the application
echo "🔨 Building application..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 4: Build macOS application
echo "🍎 Building macOS application..."
npx electron-builder --mac --arm64

# Check if macOS build succeeded
if [ $? -ne 0 ]; then
    echo "❌ macOS build failed!"
    exit 1
fi

echo "✅ Build complete!"
echo ""
echo "📁 Output files:"
echo "   - dist/darwin/arm64/Marksmith-mac-arm64.dmg"
echo "   - dist/darwin/arm64/Marksmith-mac-arm64.zip"
echo "   - dist/darwin/arm64/mac-arm64/Marksmith.app"
echo ""
echo "💡 To install:"
echo "   1. Double-click the DMG file"
echo "   2. Drag Marksmith to your Applications folder"
echo "   3. Launch from Applications or Spotlight"

exit 0