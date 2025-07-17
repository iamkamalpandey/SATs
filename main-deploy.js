const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting SAT Battle Royale for Cloud Run deployment...');

// Essential middleware
app.use(express.json());
app.use(express.static(__dirname));

// CRITICAL: Root endpoint health check - MUST return 200 for Cloud Run
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

// Start server - MUST bind to 0.0.0.0 for Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/`);
});

// Graceful shutdown for Cloud Run
process.on('SIGTERM', () => process.exit(0));