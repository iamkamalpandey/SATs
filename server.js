// SAT Battle Royale - Production Server
// This is the main server file for deployment

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for faster startup
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: ['https://satbattleroyale.com', 'http://localhost:3000', /\.replit\.app$/, /\.replit\.dev$/, /\.replit\.co$/],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (required for Cloud Run)
app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'SAT Battle Royale',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SAT Battle Royale',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({
      token: 'demo-admin-token',
      user: { id: 1, email, firstName: 'Admin', lastName: 'User', role: 'admin' }
    });
  } else if (email === 'student1@example.com' && password === 'student123!') {
    res.json({
      token: 'demo-student-token',
      user: { id: 2, email, firstName: 'Student', lastName: '1', role: 'student' }
    });
  } else if (email === 'teacher@satbattle.com' && password === 'teacher123!') {
    res.json({
      token: 'demo-teacher-token',
      user: { id: 3, email, firstName: 'Teacher', lastName: 'Demo', role: 'teacher' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  res.json({
    token: 'demo-token',
    user: { id: Date.now(), email, firstName, lastName, role: 'student' }
  });
});

// API endpoints
app.get('/api/stats/user', (req, res) => {
  res.json({
    user: { currentSatScore: 1250, targetSatScore: 1500, level: 5, xp: 2450, streakDays: 12 },
    accuracy: 78
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    totalUsers: 156, activeUsers: 89, totalGames: 342, 
    totalQuestions: 1500, totalLeads: 23, newLeads: 5
  });
});

app.get('/api/admin/leads', (req, res) => {
  res.json([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', school: 'Lincoln High School', status: 'new' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', school: 'Washington High School', status: 'contacted' }
  ]);
});

app.get('/api/challenges/daily', (req, res) => {
  res.json([
    { id: 1, category: 'mathematics', difficulty: 'medium' },
    { id: 2, category: 'reading_writing', difficulty: 'easy' }
  ]);
});

app.get('/api/battles', (req, res) => {
  res.json([
    { id: 1, status: 'waiting', currentPlayers: 3, maxPlayers: 10 }
  ]);
});

app.post('/api/battles', (req, res) => {
  res.json({
    id: Date.now(), status: 'waiting', currentPlayers: 1, 
    maxPlayers: req.body.maxPlayers || 10
  });
});

app.post('/api/battles/:id/join', (req, res) => {
  res.json({ success: true });
});

// Static files
app.use(express.static(path.join(__dirname)));

// HTML routes
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/challenge', (req, res) => {
  res.sendFile(path.join(__dirname, 'challenge.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAT Battle Royale server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/`);
});

module.exports = app;