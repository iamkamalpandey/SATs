import { 
  users, 
  userProfiles,
  satQuestions, 
  battleRoyaleGames,
  gameParticipants,
  userAnswers,
  dailyChallenges,
  userDailyChallenges,
  squads,
  squadMembers,
  userProgress,
  leads,
  aiAnalysis,
  type User, 
  type InsertUser, 
  type UserProfile,
  type InsertUserProfile,
  type SatQuestion,
  type InsertSatQuestion,
  type BattleRoyaleGame,
  type InsertBattleRoyaleGame,
  type GameParticipant,
  type UserAnswer,
  type DailyChallenge,
  type Squad,
  type SquadMember,
  type UserProgress,
  type Lead,
  type InsertLead,
  type AiAnalysis
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, avg, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // User profiles
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // SAT Questions
  getSatQuestions(category?: string, difficulty?: string, limit?: number): Promise<SatQuestion[]>;
  getSatQuestion(id: number): Promise<SatQuestion | undefined>;
  createSatQuestion(question: InsertSatQuestion): Promise<SatQuestion>;
  
  // Battle Royale Games
  getBattleRoyaleGames(status?: string, limit?: number): Promise<BattleRoyaleGame[]>;
  getBattleRoyaleGame(id: number): Promise<BattleRoyaleGame | undefined>;
  createBattleRoyaleGame(game: InsertBattleRoyaleGame): Promise<BattleRoyaleGame>;
  updateBattleRoyaleGame(id: number, updates: Partial<InsertBattleRoyaleGame>): Promise<BattleRoyaleGame>;
  
  // Game Participants
  addGameParticipant(gameId: number, userId: number): Promise<GameParticipant>;
  getGameParticipants(gameId: number): Promise<GameParticipant[]>;
  updateGameParticipant(gameId: number, userId: number, updates: Partial<GameParticipant>): Promise<GameParticipant>;
  
  // User Answers
  saveUserAnswer(answer: Omit<UserAnswer, 'id' | 'answeredAt'>): Promise<UserAnswer>;
  getUserAnswers(userId: number, limit?: number): Promise<UserAnswer[]>;
  
  // Daily Challenges
  getDailyChallenges(date?: Date, limit?: number): Promise<DailyChallenge[]>;
  createDailyChallenge(challenge: Omit<DailyChallenge, 'id' | 'createdAt'>): Promise<DailyChallenge>;
  
  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, category: string, difficulty: string, updates: Partial<UserProgress>): Promise<UserProgress>;
  
  // Squads
  getSquads(limit?: number): Promise<Squad[]>;
  getSquad(id: number): Promise<Squad | undefined>;
  createSquad(squad: Omit<Squad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Squad>;
  
  // Squad Members
  addSquadMember(squadId: number, userId: number): Promise<SquadMember>;
  getSquadMembers(squadId: number): Promise<SquadMember[]>;
  
  // Leads (Admin)
  getLeads(status?: string, limit?: number): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead>;
  
  // AI Analysis
  saveAiAnalysis(analysis: Omit<AiAnalysis, 'id' | 'createdAt'>): Promise<AiAnalysis>;
  getUserAiAnalysis(userId: number, limit?: number): Promise<AiAnalysis[]>;
  
  // Analytics
  getUserStats(userId: number): Promise<any>;
  getGameStats(gameId: number): Promise<any>;
  getAdminDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getSatQuestions(category?: string, difficulty?: string, limit = 50): Promise<SatQuestion[]> {
    let query = db.select().from(satQuestions).where(eq(satQuestions.isActive, true));
    
    if (category) {
      query = query.where(eq(satQuestions.category, category as any));
    }
    
    if (difficulty) {
      query = query.where(eq(satQuestions.difficulty, difficulty as any));
    }
    
    return query.limit(limit);
  }

  async getSatQuestion(id: number): Promise<SatQuestion | undefined> {
    const [question] = await db.select().from(satQuestions).where(eq(satQuestions.id, id));
    return question || undefined;
  }

  async createSatQuestion(question: InsertSatQuestion): Promise<SatQuestion> {
    const [newQuestion] = await db.insert(satQuestions).values(question).returning();
    return newQuestion;
  }

  async getBattleRoyaleGames(status?: string, limit = 20): Promise<BattleRoyaleGame[]> {
    let query = db.select().from(battleRoyaleGames).orderBy(desc(battleRoyaleGames.createdAt));
    
    if (status) {
      query = query.where(eq(battleRoyaleGames.status, status as any));
    }
    
    return query.limit(limit);
  }

  async getBattleRoyaleGame(id: number): Promise<BattleRoyaleGame | undefined> {
    const [game] = await db.select().from(battleRoyaleGames).where(eq(battleRoyaleGames.id, id));
    return game || undefined;
  }

  async createBattleRoyaleGame(game: InsertBattleRoyaleGame): Promise<BattleRoyaleGame> {
    const [newGame] = await db.insert(battleRoyaleGames).values(game).returning();
    return newGame;
  }

  async updateBattleRoyaleGame(id: number, updates: Partial<InsertBattleRoyaleGame>): Promise<BattleRoyaleGame> {
    const [updatedGame] = await db
      .update(battleRoyaleGames)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(battleRoyaleGames.id, id))
      .returning();
    return updatedGame;
  }

  async addGameParticipant(gameId: number, userId: number): Promise<GameParticipant> {
    const [participant] = await db
      .insert(gameParticipants)
      .values({ gameId, userId })
      .returning();
    return participant;
  }

  async getGameParticipants(gameId: number): Promise<GameParticipant[]> {
    return db.select().from(gameParticipants).where(eq(gameParticipants.gameId, gameId));
  }

  async updateGameParticipant(gameId: number, userId: number, updates: Partial<GameParticipant>): Promise<GameParticipant> {
    const [updatedParticipant] = await db
      .update(gameParticipants)
      .set(updates)
      .where(and(eq(gameParticipants.gameId, gameId), eq(gameParticipants.userId, userId)))
      .returning();
    return updatedParticipant;
  }

  async saveUserAnswer(answer: Omit<UserAnswer, 'id' | 'answeredAt'>): Promise<UserAnswer> {
    const [newAnswer] = await db.insert(userAnswers).values(answer).returning();
    return newAnswer;
  }

  async getUserAnswers(userId: number, limit = 50): Promise<UserAnswer[]> {
    return db.select()
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .orderBy(desc(userAnswers.answeredAt))
      .limit(limit);
  }

  async getDailyChallenges(date?: Date, limit = 10): Promise<DailyChallenge[]> {
    let query = db.select().from(dailyChallenges).where(eq(dailyChallenges.isActive, true));
    
    if (date) {
      query = query.where(eq(dailyChallenges.date, date));
    }
    
    return query.orderBy(desc(dailyChallenges.date)).limit(limit);
  }

  async createDailyChallenge(challenge: Omit<DailyChallenge, 'id' | 'createdAt'>): Promise<DailyChallenge> {
    const [newChallenge] = await db.insert(dailyChallenges).values(challenge).returning();
    return newChallenge;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.updatedAt));
  }

  async updateUserProgress(userId: number, category: string, difficulty: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const [existingProgress] = await db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.category, category as any),
        eq(userProgress.difficulty, difficulty as any)
      ));

    if (existingProgress) {
      const [updatedProgress] = await db
        .update(userProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updatedProgress;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values({ userId, category: category as any, difficulty: difficulty as any, ...updates })
        .returning();
      return newProgress;
    }
  }

  async getSquads(limit = 20): Promise<Squad[]> {
    return db.select()
      .from(squads)
      .where(eq(squads.isActive, true))
      .orderBy(desc(squads.totalXp))
      .limit(limit);
  }

  async getSquad(id: number): Promise<Squad | undefined> {
    const [squad] = await db.select().from(squads).where(eq(squads.id, id));
    return squad || undefined;
  }

  async createSquad(squad: Omit<Squad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Squad> {
    const [newSquad] = await db.insert(squads).values(squad).returning();
    return newSquad;
  }

  async addSquadMember(squadId: number, userId: number): Promise<SquadMember> {
    const [member] = await db
      .insert(squadMembers)
      .values({ squadId, userId })
      .returning();
    return member;
  }

  async getSquadMembers(squadId: number): Promise<SquadMember[]> {
    return db.select()
      .from(squadMembers)
      .where(and(eq(squadMembers.squadId, squadId), eq(squadMembers.isActive, true)));
  }

  async getLeads(status?: string, limit = 50): Promise<Lead[]> {
    let query = db.select().from(leads).orderBy(desc(leads.createdAt));
    
    if (status) {
      query = query.where(eq(leads.status, status as any));
    }
    
    return query.limit(limit);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async saveAiAnalysis(analysis: Omit<AiAnalysis, 'id' | 'createdAt'>): Promise<AiAnalysis> {
    const [newAnalysis] = await db.insert(aiAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async getUserAiAnalysis(userId: number, limit = 10): Promise<AiAnalysis[]> {
    return db.select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.userId, userId))
      .orderBy(desc(aiAnalysis.createdAt))
      .limit(limit);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    const answers = await db.select()
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId));
    
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    const progress = await this.getUserProgress(userId);
    
    return {
      user,
      totalAnswers,
      correctAnswers,
      accuracy,
      progress,
      level: user?.level || 1,
      xp: user?.xp || 0,
      streakDays: user?.streakDays || 0,
    };
  }

  async getGameStats(gameId: number): Promise<any> {
    const game = await this.getBattleRoyaleGame(gameId);
    const participants = await this.getGameParticipants(gameId);
    
    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(p => p.isActive).length;
    const completedParticipants = participants.filter(p => p.finalPosition !== null).length;
    
    return {
      game,
      totalParticipants,
      activeParticipants,
      completedParticipants,
      participants,
    };
  }

  async getAdminDashboardStats(): Promise<any> {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [totalGames] = await db.select({ count: count() }).from(battleRoyaleGames);
    const [totalQuestions] = await db.select({ count: count() }).from(satQuestions);
    const [totalLeads] = await db.select({ count: count() }).from(leads);
    const [newLeads] = await db.select({ count: count() }).from(leads).where(eq(leads.status, 'new'));
    
    const recentUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
    
    const recentGames = await db.select()
      .from(battleRoyaleGames)
      .orderBy(desc(battleRoyaleGames.createdAt))
      .limit(10);
    
    return {
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      totalGames: totalGames.count,
      totalQuestions: totalQuestions.count,
      totalLeads: totalLeads.count,
      newLeads: newLeads.count,
      recentUsers,
      recentGames,
    };
  }
}

export const storage = new DatabaseStorage();