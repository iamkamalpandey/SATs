#!/bin/bash
echo "🚀 Starting SAT Battle Royale Application..."

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Navigate to the application directory
cd /home/runner/workspace

# Start the server
echo "🎯 Starting server with server.js on port $PORT..."
exec node server.js