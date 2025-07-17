#!/usr/bin/env node

// Cloud Run deployment entry point
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 SAT Battle Royale - Cloud Run Deployment');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🌐 Port: ${PORT}`);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    : ['*'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REQUIRED: Root endpoint health check for Cloud Run
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale',
    version: '1.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Additional health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Demo API endpoints for deployment testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({
      token: 'demo-admin-token',
      user: { id: 1, email: 'admin@satbattle.com', firstName: 'Admin', lastName: 'User', role: 'admin' }
    });
  } else if (email === 'student1@example.com' && password === 'student123!') {
    res.json({
      token: 'demo-student-token',
      user: { id: 2, email: 'student1@example.com', firstName: 'Student', lastName: '1', role: 'student' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Landing page for browser access
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// Start server on 0.0.0.0 for Cloud Run
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAT Battle Royale server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/`);
  console.log(`✅ Additional health: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown for Cloud Run
const gracefulShutdown = () => {
  console.log('Shutting down SAT Battle Royale...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = app;