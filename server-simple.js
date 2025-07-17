const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 SAT Battle Royale Server Starting (Simple Version)...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${PORT}`);

// Minimal middleware
app.use(express.json());

// Ultra-fast health check - no extra processing
app.get('/', (req, res) => {
  res.json({ status: 'healthy' });
});

// Detailed health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale'
  });
});

// Essential API endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({ token: 'demo-admin-token', user: { id: 1, email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({ totalUsers: 156, activeUsers: 89, totalGames: 342 });
});

// Start server with enhanced error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`❤️  Health check: http://0.0.0.0:${PORT}/`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  console.log('🛑 Shutting down...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;