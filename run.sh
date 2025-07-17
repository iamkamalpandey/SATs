#!/bin/bash
echo "🚀 Starting SAT Battle Royale Application..."

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Navigate to the application directory
cd /home/runner/workspace

# Check which entry point to use
if [ -f "run.js" ]; then
    echo "🎯 Starting server with run.js on port $PORT..."
    exec node run.js
elif [ -f "app.js" ]; then
    echo "🎯 Starting server with app.js on port $PORT..."
    exec node app.js
elif [ -f "index.js" ]; then
    echo "🎯 Starting server with index.js on port $PORT..."
    exec node index.js
else
    echo "❌ Error: No entry point found!"
    exit 1
fi