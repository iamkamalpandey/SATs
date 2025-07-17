#!/usr/bin/env node

// Primary entry point for Cloud Run deployment
console.log('🚀 Starting SAT Battle Royale for Cloud Run...');

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

// Error handling for production
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the application
require('./start.js');