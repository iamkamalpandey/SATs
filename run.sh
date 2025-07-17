#!/bin/bash
echo "🚀 Starting SAT Battle Royale Application..."

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Navigate to the application directory
cd /home/runner/workspace

# Check if start.js exists
if [ ! -f "start.js" ]; then
    echo "❌ Error: start.js not found!"
    exit 1
fi

# Start the application
echo "🎯 Starting server on port $PORT..."
exec node start.js