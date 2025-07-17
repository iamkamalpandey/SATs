#!/usr/bin/env node
// NPM wrapper script to handle deployment build commands
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the command from command line arguments
const command = process.argv[2];
const args = process.argv.slice(3);

console.log(`Running: npm ${command} ${args.join(' ')}`);

switch (command) {
  case 'run':
    if (args[0] === 'build') {
      // Handle build command
      console.log('Executing build process...');
      
      // Run the build script
      const buildScript = path.join(__dirname, 'build.js');
      const buildProcess = spawn('node', [buildScript], { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Build completed successfully!');
        } else {
          console.error(`Build failed with code ${code}`);
          process.exit(code);
        }
      });
      
      buildProcess.on('error', (error) => {
        console.error('Build process error:', error);
        process.exit(1);
      });
    } else {
      console.error(`Unknown script: ${args[0]}`);
      process.exit(1);
    }
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}