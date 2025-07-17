const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting SAT Battle Royale...');

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
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple API routes for demo
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Additional health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale',
    version: '1.0.0'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login - in production this would verify against database
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({
      token: 'demo-admin-token',
      user: {
        id: 1,
        email: 'admin@satbattle.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
  } else if (email === 'student1@example.com' && password === 'student123!') {
    res.json({
      token: 'demo-student-token',
      user: {
        id: 2,
        email: 'student1@example.com',
        firstName: 'Student',
        lastName: '1',
        role: 'student'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Demo registration
  res.json({
    token: 'demo-token',
    user: {
      id: Date.now(),
      email,
      firstName,
      lastName,
      role: 'student'
    }
  });
});

// Demo API endpoints
app.get('/api/stats/user', (req, res) => {
  res.json({
    user: {
      currentSatScore: 1250,
      targetSatScore: 1500,
      level: 5,
      xp: 2450,
      streakDays: 12
    },
    accuracy: 78
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    totalUsers: 156,
    activeUsers: 89,
    totalGames: 342,
    totalQuestions: 1500,
    totalLeads: 23,
    newLeads: 5
  });
});

app.get('/api/admin/leads', (req, res) => {
  res.json([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      school: 'Lincoln High School',
      status: 'new'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      school: 'Washington High School',
      status: 'contacted'
    }
  ]);
});

app.get('/api/challenges/daily', (req, res) => {
  res.json([
    {
      id: 1,
      category: 'mathematics',
      difficulty: 'medium'
    },
    {
      id: 2,
      category: 'reading_writing',
      difficulty: 'easy'
    }
  ]);
});

app.get('/api/battles', (req, res) => {
  res.json([
    {
      id: 1,
      status: 'waiting',
      currentPlayers: 3,
      maxPlayers: 10
    }
  ]);
});

app.post('/api/battles', (req, res) => {
  res.json({
    id: Date.now(),
    status: 'waiting',
    currentPlayers: 1,
    maxPlayers: req.body.maxPlayers || 10
  });
});

app.post('/api/battles/:id/join', (req, res) => {
  res.json({ success: true });
});

// Health check endpoint for Cloud Run deployment (must be before static files)
app.get('/', (req, res) => {
  // Check if this is a health check request (accepts JSON)
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'SAT Battle Royale',
      version: '1.0.0'
    });
  } else {
    // Serve the landing page for browser requests
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Landing page route (alternative)
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/challenge', (req, res) => {
  res.sendFile(path.join(__dirname, 'challenge.html'));
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAT Battle Royale server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`🌐 Landing page: http://localhost:${PORT}/app`);
  console.log(`🎮 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎯 Challenge: http://localhost:${PORT}/challenge`);
  
  console.log('\n🎯 Ready to use! Try these demo accounts:');
  console.log('  📧 Admin: admin@satbattle.com / admin123!');
  console.log('  👨‍🎓 Student: student1@example.com / student123!');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SAT Battle Royale...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down SAT Battle Royale...');
  process.exit(0);
});