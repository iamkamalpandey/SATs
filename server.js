#!/usr/bin/env node

// Primary server entry point for Replit preview
const startServer = () => {
  console.log('🚀 SAT Battle Royale - Starting server for Replit preview...');
  
  // Set optimal environment variables for Replit
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '3000';
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  // Import and start the main application
  require('./start.js');
};

// Start the server
startServer();