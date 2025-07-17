#!/usr/bin/env node
// Simulated npm build script for deployment
console.log('npm run build: Starting build process...');

// Import the build script
const { exec } = require('child_process');
const path = require('path');

// Run the build process
const buildScript = path.join(__dirname, 'scripts', 'build.js');
exec(`node ${buildScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('Build warnings:', stderr);
  }
  
  console.log(stdout);
  console.log('npm run build: Build completed successfully!');
});