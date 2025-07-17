#!/usr/bin/env node

// Development server script for Replit workflow
console.log('🚀 Starting SAT Battle Royale development server...');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3000';

// Start the application
require('./start.js');