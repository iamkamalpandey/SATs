// SAT Battle Royale - Entry Point
// This file serves as the main entry point for the application
console.log('Starting SAT Battle Royale application...');

// Check if we have all required files
const fs = require('fs');
const path = require('path');

const requiredFiles = ['app.js', 'index.html', 'dashboard.html', 'challenge.html'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));

if (missingFiles.length > 0) {
  console.error('Missing required files:', missingFiles);
  process.exit(1);
}

// Load and start the application
const app = require('./app');

// Export for potential import
module.exports = app;