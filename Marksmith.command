#!/bin/bash

# Marksmith Launcher
# Simple .command file to launch Marksmith

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the Marksmith directory
cd "$SCRIPT_DIR"

# Check if we're in a Marksmith directory
test -f "package.json" || {
    echo "❌ Error: Not in a Marksmith directory"
    exit 1
}

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed."
    echo ""
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed. Please check the error above."
        exit 1
    fi
    
    echo "✅ Dependencies installed!"
fi

# Try to launch the application
echo "🚀 Launching Marksmith..."
echo ""

# Try production launch first
if npm start; then
    echo "✅ Marksmith launched successfully!"
else
    echo "⚠️  Production launch failed. Trying development mode..."
    npm run dev
fi
