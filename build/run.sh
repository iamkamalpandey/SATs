#!/bin/bash

echo "Starting SAT Battle Royale..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-3000}

# Ensure we're in the correct directory
cd /home/runner/workspace

# Check if main entry file exists (matching package.json)
if [ ! -f "index.js" ]; then
    echo "Error: index.js not found"
    exit 1
fi

# Start the application
echo "Starting server on port $PORT"
exec node index.js