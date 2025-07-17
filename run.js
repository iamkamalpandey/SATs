const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting SAT Battle Royale server...');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CRITICAL: Root endpoint health check for Cloud Run
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale',
    version: '1.0.0'
  });
});

// Additional health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({ token: 'demo-admin-token', user: { id: 1, email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Landing page
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server on 0.0.0.0 for Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/`);
});

// Graceful shutdown for Cloud Run
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});