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

// Root health check - Required for Cloud Run
app.get('/', (req, res) => {
  res.json({ status: 'healthy' });
});

// Detailed health endpoint
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

// Enhanced API endpoints with dynamic data
app.get('/api/stats/user', (req, res) => {
  const baseScore = 1200 + Math.floor(Math.random() * 200);
  const xp = 2000 + Math.floor(Math.random() * 1000);
  const level = Math.floor(xp / 500) + 1;
  const streak = Math.floor(Math.random() * 30) + 1;
  const accuracy = 70 + Math.floor(Math.random() * 25);
  
  res.json({
    user: { 
      currentSatScore: baseScore, 
      targetSatScore: 1500, 
      level: level, 
      xp: xp, 
      streakDays: streak 
    },
    accuracy: accuracy,
    recentActivity: [
      { type: 'battle', result: 'won', xp: 120, timestamp: Date.now() - 3600000 },
      { type: 'challenge', result: 'completed', xp: 80, timestamp: Date.now() - 7200000 },
      { type: 'streak', result: 'maintained', xp: 50, timestamp: Date.now() - 86400000 }
    ],
    achievements: [
      { id: 1, name: 'First Battle', description: 'Won your first battle royale', unlocked: true },
      { id: 2, name: 'Speed Demon', description: 'Answered 10 questions in under 5 minutes', unlocked: Math.random() > 0.5 },
      { id: 3, name: 'Streak Master', description: 'Maintained a 7-day streak', unlocked: streak >= 7 }
    ]
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  const now = new Date();
  const baseUsers = 150 + Math.floor(Math.random() * 50);
  const activeUsers = Math.floor(baseUsers * (0.6 + Math.random() * 0.3));
  
  res.json({
    totalUsers: baseUsers, 
    activeUsers: activeUsers, 
    totalGames: 300 + Math.floor(Math.random() * 100), 
    totalQuestions: 1500 + Math.floor(Math.random() * 200), 
    totalLeads: 20 + Math.floor(Math.random() * 15), 
    newLeads: Math.floor(Math.random() * 8),
    dailyStats: [
      { date: 'Mon', users: 45, battles: 23 },
      { date: 'Tue', users: 52, battles: 28 },
      { date: 'Wed', users: 48, battles: 25 },
      { date: 'Thu', users: 61, battles: 32 },
      { date: 'Fri', users: 58, battles: 29 },
      { date: 'Sat', users: 43, battles: 21 },
      { date: 'Sun', users: 39, battles: 18 }
    ],
    topPerformers: [
      { name: 'Alex Chen', score: 1480, battles: 15, winRate: 87 },
      { name: 'Maria Garcia', score: 1465, battles: 12, winRate: 83 },
      { name: 'David Johnson', score: 1452, battles: 18, winRate: 72 }
    ]
  });
});

app.get('/api/admin/leads', (req, res) => {
  res.json([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', school: 'Lincoln High School', status: 'new' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', school: 'Washington High School', status: 'contacted' }
  ]);
});

// Enhanced SAT Questions API
app.get('/api/challenges/daily', (req, res) => {
  const challenges = [
    {
      id: 1,
      category: 'mathematics',
      difficulty: 'medium',
      title: 'Algebraic Expressions',
      description: 'Solve complex algebraic equations',
      xpReward: 150,
      timeLimit: 300,
      questions: 5
    },
    {
      id: 2,
      category: 'reading_writing',
      difficulty: 'easy',
      title: 'Grammar Fundamentals',
      description: 'Master essential grammar rules',
      xpReward: 100,
      timeLimit: 240,
      questions: 4
    },
    {
      id: 3,
      category: 'mathematics',
      difficulty: 'hard',
      title: 'Advanced Functions',
      description: 'Complex function analysis',
      xpReward: 200,
      timeLimit: 420,
      questions: 6
    }
  ];
  
  res.json(challenges);
});

// Enhanced Question Content
app.get('/api/questions/:category', (req, res) => {
  const { category } = req.params;
  
  const mathQuestions = [
    {
      id: 1,
      question: "If 3x + 7 = 22, what is the value of x?",
      options: ["3", "5", "7", "9"],
      correct: 1,
      difficulty: "easy",
      explanation: "Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5",
      category: "algebra",
      timeEstimate: 90
    },
    {
      id: 2,
      question: "What is the area of a circle with radius 6?",
      options: ["36π", "12π", "18π", "24π"],
      correct: 0,
      difficulty: "medium",
      explanation: "Area = πr² = π(6)² = 36π",
      category: "geometry",
      timeEstimate: 120
    },
    {
      id: 3,
      question: "If f(x) = 2x² - 3x + 1, what is f(4)?",
      options: ["21", "25", "29", "33"],
      correct: 0,
      difficulty: "hard",
      explanation: "f(4) = 2(4)² - 3(4) + 1 = 32 - 12 + 1 = 21",
      category: "functions",
      timeEstimate: 150
    }
  ];
  
  const readingQuestions = [
    {
      id: 4,
      question: "Which word best completes the sentence: 'The student's performance was _____ impressive.'",
      options: ["quite", "quiet", "quit", "quote"],
      correct: 0,
      difficulty: "easy",
      explanation: "'Quite' means 'very' or 'rather', which fits the context perfectly",
      category: "vocabulary",
      timeEstimate: 60
    },
    {
      id: 5,
      question: "In the sentence 'Neither the teacher nor the students was ready,' what is the error?",
      options: ["Subject-verb disagreement", "Wrong pronoun", "Misplaced modifier", "No error"],
      correct: 0,
      difficulty: "medium",
      explanation: "With 'neither...nor', the verb should agree with the closer subject: 'were ready'",
      category: "grammar",
      timeEstimate: 90
    }
  ];
  
  if (category === 'mathematics') {
    res.json(mathQuestions);
  } else if (category === 'reading_writing') {
    res.json(readingQuestions);
  } else {
    res.json([...mathQuestions, ...readingQuestions]);
  }
});

// Enhanced Battle Royale System
app.get('/api/battles', (req, res) => {
  const battles = [
    { 
      id: 1, 
      status: 'waiting', 
      currentPlayers: 7, 
      maxPlayers: 10,
      category: 'mixed',
      difficulty: 'medium',
      startTime: Date.now() + 300000, // 5 minutes from now
      duration: 1800, // 30 minutes
      prize: 500,
      region: 'North America'
    },
    { 
      id: 2, 
      status: 'active', 
      currentPlayers: 15, 
      maxPlayers: 20,
      category: 'mathematics',
      difficulty: 'hard',
      startTime: Date.now() - 600000, // started 10 minutes ago
      duration: 2400, // 40 minutes
      prize: 800,
      region: 'Global'
    },
    { 
      id: 3, 
      status: 'waiting', 
      currentPlayers: 2, 
      maxPlayers: 5,
      category: 'reading_writing',
      difficulty: 'easy',
      startTime: Date.now() + 180000, // 3 minutes from now
      duration: 900, // 15 minutes
      prize: 200,
      region: 'Europe'
    }
  ];
  
  res.json(battles);
});

app.post('/api/battles', (req, res) => {
  const { maxPlayers, category, difficulty, duration } = req.body;
  
  const battleId = Date.now();
  const newBattle = {
    id: battleId,
    status: 'waiting',
    currentPlayers: 1,
    maxPlayers: maxPlayers || 10,
    category: category || 'mixed',
    difficulty: difficulty || 'medium',
    startTime: Date.now() + 300000, // 5 minutes from now
    duration: duration || 1800,
    prize: Math.floor((maxPlayers || 10) * 50),
    region: 'Global',
    creator: req.body.userId || 'anonymous'
  };
  
  res.json(newBattle);
});

app.post('/api/battles/:id/join', (req, res) => {
  const battleId = req.params.id;
  const userId = req.body.userId || 'anonymous';
  
  // Simulate joining logic
  const joinSuccess = Math.random() > 0.1; // 90% success rate
  
  if (joinSuccess) {
    res.json({ 
      success: true, 
      message: 'Successfully joined the battle!',
      position: Math.floor(Math.random() * 8) + 2, // Position 2-9
      estimatedStart: Date.now() + Math.floor(Math.random() * 300000) // 0-5 minutes
    });
  } else {
    res.status(400).json({ 
      success: false, 
      error: 'Battle is full or no longer accepting players' 
    });
  }
});

// Battle Results and Leaderboard
app.get('/api/battles/:id/results', (req, res) => {
  const battleId = req.params.id;
  
  const results = {
    battleId: battleId,
    status: 'completed',
    totalPlayers: 15,
    questionsAnswered: 25,
    averageScore: 78,
    leaderboard: [
      { rank: 1, name: 'Alex Thunder', score: 95, xpGained: 300, timeBonus: 50 },
      { rank: 2, name: 'Sarah Lightning', score: 92, xpGained: 250, timeBonus: 40 },
      { rank: 3, name: 'Mike Storm', score: 88, xpGained: 200, timeBonus: 30 },
      { rank: 4, name: 'You', score: 85, xpGained: 180, timeBonus: 20 },
      { rank: 5, name: 'Emma Blaze', score: 82, xpGained: 150, timeBonus: 15 }
    ],
    achievements: [
      { name: 'Top 5 Finish', description: 'Finished in the top 5', xp: 50 },
      { name: 'Speed Bonus', description: 'Answered quickly', xp: 25 }
    ]
  };
  
  res.json(results);
});

// Live Battle Status
app.get('/api/battles/:id/status', (req, res) => {
  const battleId = req.params.id;
  
  const liveStatus = {
    battleId: battleId,
    currentRound: Math.floor(Math.random() * 5) + 1,
    totalRounds: 5,
    playersRemaining: Math.floor(Math.random() * 8) + 3,
    timeRemaining: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
    currentQuestion: Math.floor(Math.random() * 20) + 1,
    yourRank: Math.floor(Math.random() * 5) + 1,
    yourScore: Math.floor(Math.random() * 40) + 60,
    recentEliminations: [
      { player: 'QuickThinker42', reason: 'Time expired', timestamp: Date.now() - 30000 },
      { player: 'MathWiz99', reason: 'Incorrect answer', timestamp: Date.now() - 60000 }
    ]
  };
  
  res.json(liveStatus);
});

// AI Hint System
app.post('/api/questions/:id/hint', (req, res) => {
  const questionId = req.params.id;
  const { difficulty, category } = req.body;
  
  const hints = {
    easy: [
      "Look for keywords that might give you a clue about the answer.",
      "Try eliminating obviously wrong answers first.",
      "Think about what you learned in class about this topic."
    ],
    medium: [
      "Break down the problem into smaller, manageable parts.",
      "Consider using the process of elimination.",
      "Look for patterns or relationships in the given information."
    ],
    hard: [
      "Apply advanced problem-solving strategies you've learned.",
      "Consider multiple approaches to solve this problem.",
      "Think about underlying mathematical or logical principles."
    ]
  };
  
  const difficultyHints = hints[difficulty] || hints.medium;
  const selectedHint = difficultyHints[Math.floor(Math.random() * difficultyHints.length)];
  
  res.json({
    hint: selectedHint,
    cost: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    confidence: 0.8 + Math.random() * 0.2 // 80-100% confidence
  });
});

// Achievement System
app.get('/api/achievements', (req, res) => {
  const achievements = [
    { 
      id: 1, 
      name: 'First Victory', 
      description: 'Win your first battle royale', 
      icon: '🏆',
      category: 'battle',
      rarity: 'common',
      xpReward: 100,
      unlocked: true,
      unlockedAt: Date.now() - 86400000
    },
    { 
      id: 2, 
      name: 'Speed Demon', 
      description: 'Answer 10 questions in under 5 minutes', 
      icon: '⚡',
      category: 'skill',
      rarity: 'rare',
      xpReward: 200,
      unlocked: Math.random() > 0.6,
      progress: Math.floor(Math.random() * 10),
      target: 10
    },
    { 
      id: 3, 
      name: 'Streak Master', 
      description: 'Maintain a 14-day learning streak', 
      icon: '🔥',
      category: 'consistency',
      rarity: 'epic',
      xpReward: 500,
      unlocked: false,
      progress: Math.floor(Math.random() * 14),
      target: 14
    }
  ];
  
  res.json(achievements);
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

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAT Battle Royale running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;