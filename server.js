const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 SAT Battle Royale Server Starting...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${PORT}`);
console.log(`🔍 Debug Mode: ENABLED`);
console.log(`📅 Startup Time: ${new Date().toISOString()}`);

// Minimal middleware for faster startup and health checks
console.log('🔧 Setting up middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware (minimal for faster health checks)
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for faster responses
}));

// CORS configuration (simplified)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

console.log('✅ Middleware setup complete');

// CRITICAL: Root health check endpoint - MUST return 200 for Cloud Run
// Optimized for fastest possible response with debugging
app.get('/', (req, res) => {
  console.log(`🔍 Health check request at ${new Date().toISOString()}`);
  const response = { 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'SAT Battle Royale',
    port: PORT
  };
  console.log(`✅ Health check response: ${JSON.stringify(response)}`);
  res.status(200).json(response);
});

// Additional health endpoint with detailed info
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SAT Battle Royale',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
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

// Error handling middleware with enhanced debugging
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  console.error('❌ Error Stack:', error.stack);
  console.error('❌ Request Path:', req.path);
  console.error('❌ Request Method:', req.method);
  console.error('❌ Request Headers:', req.headers);
  
  const errorResponse = {
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };
  
  console.error('❌ Error Response:', JSON.stringify(errorResponse));
  res.status(500).json(errorResponse);
});

// Start server - MUST bind to 0.0.0.0 for Cloud Run
console.log('🔧 Starting server...');
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
  console.log('');
  console.log('🔍 Server debug info:');
  console.log(`  - Process ID: ${process.pid}`);
  console.log(`  - Node version: ${process.version}`);
  console.log(`  - Platform: ${process.platform}`);
  console.log(`  - Architecture: ${process.arch}`);
  console.log(`  - Memory usage: ${JSON.stringify(process.memoryUsage())}`);
});

// Add server error handling with enhanced debugging
server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  console.error('❌ Error code:', error.code);
  console.error('❌ Error message:', error.message);
  console.error('❌ Full error:', JSON.stringify(error, null, 2));
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
    console.error('❌ Try running: pkill -f "node" to kill existing processes');
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied accessing port ${PORT}`);
  }
  
  console.error('❌ Process will exit in 5 seconds...');
  setTimeout(() => process.exit(1), 5000);
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