#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting SAT Battle Royale Application..."

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Debug information
echo "🔍 Debug Information:"
echo "  - Working directory: $(pwd)"
echo "  - Node version: $(node --version)"
echo "  - NPM version: $(npm --version)"
echo "  - Environment: $NODE_ENV"
echo "  - Port: $PORT"
echo "  - Process ID: $$"
echo "  - User: $(whoami)"
echo ""

# Navigate to the application directory
cd /home/runner/workspace || exit 1

# Verify server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found!"
    echo "📂 Files in current directory:"
    ls -la
    exit 1
fi

# Check if port is available
if command -v netstat >/dev/null 2>&1; then
    if netstat -tln | grep -q ":$PORT "; then
        echo "⚠️  Warning: Port $PORT appears to be in use"
        echo "🔧 Attempting to kill existing processes..."
        pkill -f "node server.js" || true
        sleep 2
    fi
fi

# Start the server
echo "🎯 Starting server with server.js on port $PORT..."
echo "📊 Environment: $NODE_ENV"
echo "🌐 Health check endpoint: http://0.0.0.0:$PORT/"
echo ""

exec node server.js