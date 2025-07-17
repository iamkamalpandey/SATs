const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// CRITICAL: Root endpoint health check for Cloud Run (returns 200 status)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SAT Battle Royale',
    version: '1.0.0',
    port: PORT
  });
});

// Additional health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@satbattle.com' && password === 'admin123!') {
    res.json({ token: 'demo-token', user: { id: 1, email, role: 'admin' } });
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
  console.log(`SAT Battle Royale server running on port ${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/`);
});

// Graceful shutdown for Cloud Run
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));