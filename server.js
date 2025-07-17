const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 SAT Battle Royale Server Starting...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
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
  origin: true,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CRITICAL: Root health check endpoint - MUST return 200 for Cloud Run
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SAT Battle Royale',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Additional health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    service: 'SAT Battle Royale'
  });
});

// API endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
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

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes for HTML pages
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
  console.error('❌ Server Error:', error);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

// Start server - MUST bind to 0.0.0.0 for Cloud Run
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SAT Battle Royale server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health check: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 Additional health: http://0.0.0.0:${PORT}/health`);
  console.log('');
  console.log('📱 Available endpoints:');
  console.log('  🏠 Landing page: /app');
  console.log('  📊 Dashboard: /dashboard');
  console.log('  🎯 Challenge: /challenge');
  console.log('');
  console.log('🎮 Demo accounts:');
  console.log('  👨‍💼 Admin: admin@satbattle.com / admin123!');
  console.log('  👨‍🎓 Student: student1@example.com / student123!');
});

// Graceful shutdown for Cloud Run
const gracefulShutdown = () => {
  console.log('🛑 Shutting down SAT Battle Royale server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

module.exports = app;