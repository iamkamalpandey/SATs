import { pgTable, serial, text, timestamp, integer, boolean, jsonb, uuid as pgUuid, varchar, real, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'admin', 'teacher']);
export const gameStatusEnum = pgEnum('game_status', ['waiting', 'active', 'completed', 'cancelled']);
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'student_produced']);
export const questionCategoryEnum = pgEnum('question_category', ['reading_writing', 'mathematics']);
export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'interested', 'converted', 'lost']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  role: userRoleEnum('role').default('student').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  currentSatScore: integer('current_sat_score').default(0),
  targetSatScore: integer('target_sat_score').default(1600),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  streakDays: integer('streak_days').default(0),
  lastActiveDate: timestamp('last_active_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User profiles for additional information
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  school: varchar('school', { length: 255 }),
  graduationYear: integer('graduation_year'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  preferences: jsonb('preferences'),
  achievements: jsonb('achievements').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// SAT Questions
export const satQuestions = pgTable('sat_questions', {
  id: serial('id').primaryKey(),
  category: questionCategoryEnum('category').notNull(),
  type: questionTypeEnum('type').notNull(),
  difficulty: difficultyLevelEnum('difficulty').notNull(),
  question: text('question').notNull(),
  options: jsonb('options'), // For multiple choice questions
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  timeLimit: integer('time_limit').default(90), // seconds
  tags: jsonb('tags').default([]),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Battle Royale Games
export const battleRoyaleGames = pgTable('battle_royale_games', {
  id: serial('id').primaryKey(),
  gameId: pgUuid('game_id').defaultRandom().unique().notNull(),
  status: gameStatusEnum('status').default('waiting').notNull(),
  maxPlayers: integer('max_players').default(100).notNull(),
  currentPlayers: integer('current_players').default(0).notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  questions: jsonb('questions').default([]), // Array of question IDs
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Game Participants
export const gameParticipants = pgTable('game_participants', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => battleRoyaleGames.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  finalPosition: integer('final_position'),
  score: integer('score').default(0),
  correctAnswers: integer('correct_answers').default(0),
  totalAnswers: integer('total_answers').default(0),
  xpEarned: integer('xp_earned').default(0),
  isActive: boolean('is_active').default(true).notNull(),
});

// User Answer History
export const userAnswers = pgTable('user_answers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer('question_id').references(() => satQuestions.id, { onDelete: 'cascade' }).notNull(),
  gameId: integer('game_id').references(() => battleRoyaleGames.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeSpent: integer('time_spent'), // seconds
  hintsUsed: integer('hints_used').default(0),
  aiAnalysis: jsonb('ai_analysis'), // DeepSeek AI analysis
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
});

// Daily Challenges
export const dailyChallenges = pgTable('daily_challenges', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  category: questionCategoryEnum('category').notNull(),
  difficulty: difficultyLevelEnum('difficulty').notNull(),
  questionIds: jsonb('question_ids').notNull(), // Array of question IDs
  participants: integer('participants').default(0),
  completions: integer('completions').default(0),
  rewards: jsonb('rewards').default({}),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Daily Challenge Progress
export const userDailyChallenges = pgTable('user_daily_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  challengeId: integer('challenge_id').references(() => dailyChallenges.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').default(0),
  completedAt: timestamp('completed_at'),
  timeSpent: integer('time_spent'), // seconds
  rewardsClaimed: boolean('rewards_claimed').default(false),
  progress: jsonb('progress').default({}),
});

// Squads (Teams)
export const squads = pgTable('squads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  leaderId: integer('leader_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  maxMembers: integer('max_members').default(4),
  currentMembers: integer('current_members').default(1),
  totalXp: integer('total_xp').default(0),
  averageScore: real('average_score').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Squad Members
export const squadMembers = pgTable('squad_members', {
  id: serial('id').primaryKey(),
  squadId: integer('squad_id').references(() => squads.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  role: varchar('role', { length: 20 }).default('member'), // leader, member
  isActive: boolean('is_active').default(true).notNull(),
});

// Progress Tracking
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: questionCategoryEnum('category').notNull(),
  difficulty: difficultyLevelEnum('difficulty').notNull(),
  totalQuestions: integer('total_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  averageTime: real('average_time').default(0),
  masteryLevel: real('mastery_level').default(0), // 0-1 scale
  lastPracticed: timestamp('last_practiced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin Leads Management
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  school: varchar('school', { length: 255 }),
  graduationYear: integer('graduation_year'),
  status: leadStatusEnum('status').default('new').notNull(),
  source: varchar('source', { length: 100 }), // website, referral, etc.
  notes: text('notes'),
  assignedTo: integer('assigned_to').references(() => users.id),
  lastContactedAt: timestamp('last_contacted_at'),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Analysis Results
export const aiAnalysis = pgTable('ai_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  analysisType: varchar('analysis_type', { length: 50 }).notNull(), // performance, weakness, recommendation
  category: questionCategoryEnum('category'),
  analysis: jsonb('analysis').notNull(),
  recommendations: jsonb('recommendations').default([]),
  confidence: real('confidence').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  answers: many(userAnswers),
  gameParticipants: many(gameParticipants),
  squadMemberships: many(squadMembers),
  progress: many(userProgress),
  aiAnalysis: many(aiAnalysis),
  dailyChallenges: many(userDailyChallenges),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const satQuestionsRelations = relations(satQuestions, ({ many }) => ({
  answers: many(userAnswers),
}));

export const battleRoyaleGamesRelations = relations(battleRoyaleGames, ({ many }) => ({
  participants: many(gameParticipants),
  answers: many(userAnswers),
}));

export const gameParticipantsRelations = relations(gameParticipants, ({ one }) => ({
  user: one(users, {
    fields: [gameParticipants.userId],
    references: [users.id],
  }),
  game: one(battleRoyaleGames, {
    fields: [gameParticipants.gameId],
    references: [battleRoyaleGames.id],
  }),
}));

export const squadsRelations = relations(squads, ({ one, many }) => ({
  leader: one(users, {
    fields: [squads.leaderId],
    references: [users.id],
  }),
  members: many(squadMembers),
}));

export const squadMembersRelations = relations(squadMembers, ({ one }) => ({
  squad: one(squads, {
    fields: [squadMembers.squadId],
    references: [squads.id],
  }),
  user: one(users, {
    fields: [squadMembers.userId],
    references: [users.id],
  }),
}));

// Insert and Select Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastActiveDate: true 
});

export const selectUserSchema = createSelectSchema(users);

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSatQuestionSchema = createInsertSchema(satQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBattleRoyaleGameSchema = createInsertSchema(battleRoyaleGames).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type SatQuestion = typeof satQuestions.$inferSelect;
export type InsertSatQuestion = z.infer<typeof insertSatQuestionSchema>;
export type BattleRoyaleGame = typeof battleRoyaleGames.$inferSelect;
export type InsertBattleRoyaleGame = z.infer<typeof insertBattleRoyaleGameSchema>;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type Squad = typeof squads.$inferSelect;
export type SquadMember = typeof squadMembers.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;