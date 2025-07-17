// SAT Battle Royale - Production Entry Point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));

// Serve static files
app.use(express.static('.'));

// Root health check - Required for Cloud Run
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Detailed health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SAT Battle Royale',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
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

// Game endpoints
app.get('/api/game/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Math', description: 'Algebraic expressions and equations' },
    { id: 2, name: 'Reading', description: 'Comprehension and analysis' },
    { id: 3, name: 'Writing', description: 'Grammar and language usage' }
  ]);
});

app.get('/api/game/questions/:category', (req, res) => {
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the value of x in the equation 2x + 5 = 13?",
      options: ["2", "3", "4", "5"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Which word best completes the sentence: 'The student's performance was _____ impressive.'",
      options: ["quite", "quiet", "quit", "quote"],
      correct: 0,
      difficulty: "medium"
    }
  ];
  res.json(sampleQuestions);
});

app.post('/api/game/submit', (req, res) => {
  const { answers, timeSpent } = req.body;
  res.json({
    score: 85,
    correct: 4,
    total: 5,
    xpGained: 120,
    timeBonus: 25
  });
});

app.get('/api/leaderboard', (req, res) => {
  res.json([
    { rank: 1, name: 'Alex Johnson', score: 1480, level: 12 },
    { rank: 2, name: 'Maria Garcia', score: 1455, level: 11 },
    { rank: 3, name: 'David Chen', score: 1420, level: 10 }
  ]);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAT Battle Royale server running on port ${PORT}`);
});

module.exports = app;