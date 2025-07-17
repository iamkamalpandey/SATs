#!/usr/bin/env node
// Build script for SAT Battle Royale
const fs = require('fs');
const path = require('path');

console.log('Starting SAT Battle Royale build process...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files to dist directory
const staticFiles = ['index.html', 'dashboard.html', 'challenge.html'];
staticFiles.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy assets directory if it exists
const assetsDir = path.join(__dirname, '..', 'assets');
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }
  
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(assetsDir, distAssetsDir);
  console.log('Copied assets directory to dist/');
}

// Ensure index.js is in dist (it should already be there from earlier)
const indexPath = path.join(distDir, 'index.js');
if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.js not found');
  process.exit(1);
}

console.log('Build complete! Files ready for deployment.');
console.log('Entry point: dist/index.js');
console.log('Server will run on port 3000');