import express from 'express';
import { AuthService, authenticateToken, adminOnly, studentOrAdmin } from './auth';
import { storage } from './storage';
import { deepSeekService } from './deepseek';
import { insertUserSchema, insertLeadSchema } from '../shared/schema';
import { z } from 'zod';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const router = express.Router();

// Auth routes
router.post('/auth/register', async (req, res) => {
  try {
    const validatedData = insertUserSchema.extend({
      confirmPassword: z.string(),
    }).parse(req.body);

    if (validatedData.password !== validatedData.confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const result = await AuthService.register(validatedData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await AuthService.refreshToken(token);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Protected routes
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const profile = await storage.getUserProfile(user.id);
    const progress = await storage.getUserProgress(user.id);
    
    res.json({
      user: { ...user, password: undefined },
      profile,
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const updates = req.body;
    
    const updatedProfile = await storage.updateUserProfile(user.id, updates);
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SAT Questions routes
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty, limit } = req.query;
    const questions = await storage.getSatQuestions(
      category as string, 
      difficulty as string, 
      parseInt(limit as string) || 20
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await storage.getSatQuestion(parseInt(req.params.id));
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/questions/:id/answer', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const questionId = parseInt(req.params.id);
    const { answer, timeSpent, hintsUsed, gameId } = req.body;
    
    const question = await storage.getSatQuestion(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    
    // Save answer
    const userAnswer = await storage.saveUserAnswer({
      userId: user.id,
      questionId,
      gameId: gameId || null,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      hintsUsed,
    });

    // Update user progress
    await storage.updateUserProgress(user.id, question.category, question.difficulty, {
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      averageTime: timeSpent,
      lastPracticed: new Date(),
    });

    // Get AI analysis
    let aiAnalysis = null;
    try {
      aiAnalysis = await deepSeekService.analyzeAnswerPattern(user.id, questionId, answer, isCorrect);
      
      // Update answer with AI analysis
      await storage.saveUserAnswer({
        ...userAnswer,
        aiAnalysis,
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      aiAnalysis,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/questions/:id/hint', authenticateToken, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const { userAnswer } = req.query;
    
    const question = await storage.getSatQuestion(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const hint = await deepSeekService.generateHint(question, userAnswer as string);
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Battle Royale routes
router.get('/battles', authenticateToken, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const games = await storage.getBattleRoyaleGames(status as string, parseInt(limit as string) || 20);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/battles', authenticateToken, async (req, res) => {
  try {
    const { maxPlayers = 100, questions = [] } = req.body;
    
    const game = await storage.createBattleRoyaleGame({
      maxPlayers,
      questions,
      settings: {},
    });

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/battles/:id/join', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const gameId = parseInt(req.params.id);
    
    const game = await storage.getBattleRoyaleGame(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game is not accepting players' });
    }

    if (game.currentPlayers >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    const participant = await storage.addGameParticipant(gameId, user.id);
    
    // Update game player count
    await storage.updateBattleRoyaleGame(gameId, {
      currentPlayers: game.currentPlayers + 1,
    });

    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Challenges routes
router.get('/challenges/daily', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const challengeDate = date ? new Date(date as string) : new Date();
    
    const challenges = await storage.getDailyChallenges(challengeDate, 5);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Squads routes
router.get('/squads', authenticateToken, async (req, res) => {
  try {
    const squads = await storage.getSquads(20);
    res.json(squads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/squads', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const { name, description, maxMembers = 4 } = req.body;
    
    const squad = await storage.createSquad({
      name,
      description,
      leaderId: user.id,
      maxMembers,
      currentMembers: 1,
      totalXp: 0,
      averageScore: 0,
      isActive: true,
    });

    // Add creator as first member
    await storage.addSquadMember(squad.id, user.id);

    res.status(201).json(squad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Analysis routes
router.get('/ai/analysis', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const analysis = await storage.getUserAiAnalysis(user.id, 10);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/analyze-performance', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const analysis = await deepSeekService.analyzeUserPerformance(user.id);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/study-plan', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const { targetScore, daysAvailable } = req.body;
    
    const studyPlan = await deepSeekService.generateStudyPlan(user.id, targetScore, daysAvailable);
    res.json(studyPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Stats routes
router.get('/stats/user', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const stats = await storage.getUserStats(user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public routes (for leads)
router.post('/leads', async (req, res) => {
  try {
    const leadData = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(leadData);
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin routes
router.get('/admin/dashboard', authenticateToken, adminOnly, async (req, res) => {
  try {
    const stats = await storage.getAdminDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    // This would need pagination implementation
    const users = await storage.getAdminDashboardStats();
    res.json(users.recentUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/leads', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const leads = await storage.getLeads(status as string, parseInt(limit as string) || 50);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/leads/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const updates = req.body;
    
    const lead = await storage.updateLead(leadId, updates);
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/questions', authenticateToken, adminOnly, async (req, res) => {
  try {
    const questionData = req.body;
    const question = await storage.createSatQuestion(questionData);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket setup for real-time battle royale
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  const gameRooms = new Map<string, Set<WebSocket>>();
  const userSockets = new Map<number, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join_game':
            const gameId = data.gameId;
            if (!gameRooms.has(gameId)) {
              gameRooms.set(gameId, new Set());
            }
            gameRooms.get(gameId)!.add(ws);
            userSockets.set(data.userId, ws);
            
            // Broadcast to all players in the game
            broadcastToGame(gameId, {
              type: 'player_joined',
              userId: data.userId,
              playerCount: gameRooms.get(gameId)!.size,
            });
            break;
            
          case 'game_answer':
            // Handle real-time answer submission
            const { userId, questionId, answer, timeSpent } = data;
            
            // Process answer and broadcast results
            broadcastToGame(data.gameId, {
              type: 'player_answered',
              userId,
              questionId,
              timeSpent,
            });
            break;
            
          case 'game_chat':
            // Handle in-game chat
            broadcastToGame(data.gameId, {
              type: 'chat_message',
              userId: data.userId,
              message: data.message,
              timestamp: new Date().toISOString(),
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove from game rooms
      for (const [gameId, players] of gameRooms.entries()) {
        players.delete(ws);
        if (players.size === 0) {
          gameRooms.delete(gameId);
        }
      }
      
      // Remove from user sockets
      for (const [userId, socket] of userSockets.entries()) {
        if (socket === ws) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  function broadcastToGame(gameId: string, message: any) {
    const players = gameRooms.get(gameId);
    if (players) {
      const messageStr = JSON.stringify(message);
      for (const player of players) {
        if (player.readyState === WebSocket.OPEN) {
          player.send(messageStr);
        }
      }
    }
  }

  return wss;
}

export default router;