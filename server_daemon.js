#!/usr/bin/env node

// Daemon script to keep the server running
const { spawn } = require('child_process');
const fs = require('fs');

function startServer() {
  console.log('🚀 Starting SAT Battle Royale server daemon...');
  
  const server = spawn('node', ['start.js'], {
    cwd: '/home/runner/workspace',
    stdio: 'pipe',
    detached: false
  });
  
  server.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  server.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}. Restarting in 2 seconds...`);
    setTimeout(startServer, 2000);
  });
  
  server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
    setTimeout(startServer, 2000);
  });
  
  // Keep the daemon running
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server daemon...');
    server.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down server daemon...');
    server.kill();
    process.exit(0);
  });
}

startServer();