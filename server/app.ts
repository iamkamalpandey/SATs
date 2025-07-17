import express from 'express';
import path from 'path';
import { seedDatabase } from './sample-data';
import { db } from './db';
import { createServer } from 'http';
import router, { setupWebSocket } from './routes';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100,
  duration: 60,
});

const rateLimiterMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too Many Requests' });
  }
};

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

// Rate limiting
app.use(rateLimiterMiddleware);

// API routes
app.use('/api', router);

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.html'));
});

app.get('/challenge', (req, res) => {
  res.sendFile(path.join(__dirname, '../challenge.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// Setup WebSocket for real-time features
setupWebSocket(server);

// Database seeding function
async function initializeDatabase() {
  try {
    // Check if database already has data
    const result = await db.execute('SELECT COUNT(*) as count FROM users');
    const userCount = Number(result.rows[0].count);
    
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding with sample data...');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    } else {
      console.log('📊 Database already contains data. Skipping seeding.');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 SAT Battle Royale server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Landing page: http://localhost:${PORT}`);
  console.log(`🎮 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`⚡ WebSocket available at ws://localhost:${PORT}/ws`);
  
  // Initialize database with sample data
  await initializeDatabase();
  
  console.log('\n🎯 Ready to use! Try these demo accounts:');
  console.log('  📧 Admin: admin@satbattle.com / admin123!');
  console.log('  👨‍🎓 Student: student1@example.com / student123!');
});

export default app;