#!/bin/bash

# SAT Battle Royale Build Script
echo "Starting SAT Battle Royale build process..."

# Create build directory if it doesn't exist
mkdir -p build

# Copy static files to build directory
echo "Copying static files..."
cp index.html build/
cp dashboard.html build/
cp challenge.html build/
cp -r assets build/ 2>/dev/null || echo "No assets directory found"

# Copy server files
echo "Copying server files..."
cp app.js build/
cp index.js build/
cp run.sh build/
chmod +x build/run.sh

echo "Build complete! Files ready for deployment."
echo "Entry point: index.js"
echo "Server will run on port 3000"