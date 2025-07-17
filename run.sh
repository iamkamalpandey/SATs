#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting SAT Battle Royale Application..."

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Navigate to the application directory
cd /home/runner/workspace || exit 1

# Verify server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found!"
    exit 1
fi

# Start the server
echo "🎯 Starting server with server.js on port $PORT..."
echo "📊 Environment: $NODE_ENV"
echo "🌐 Health check endpoint: http://0.0.0.0:$PORT/"

exec node server.js