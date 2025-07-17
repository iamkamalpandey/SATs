import { db } from './db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123!', 10);
  const adminUser = {
    id: 1,
    username: 'admin',
    email: 'admin@satbattle.com',
    passwordHash: adminPasswordHash,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create sample students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const passwordHash = await bcrypt.hash('student123!', 10);
    students.push({
      id: i + 1,
      username: `student${i}`,
      email: `student${i}@example.com`,
      passwordHash,
      firstName: `Student`,
      lastName: `${i}`,
      role: 'student',
      isActive: true,
      level: Math.floor(Math.random() * 10) + 1,
      xp: Math.floor(Math.random() * 5000),
      currentSatScore: Math.floor(Math.random() * 800) + 800,
      targetSatScore: 1500 + Math.floor(Math.random() * 100),
      streakDays: Math.floor(Math.random() * 30),
      totalGamesPlayed: Math.floor(Math.random() * 50),
      totalGamesWon: Math.floor(Math.random() * 20),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Insert users
  await db.execute(`
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, level, xp, current_sat_score, target_sat_score, streak_days, total_games_played, total_games_won, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  `, [
    adminUser.id, adminUser.username, adminUser.email, adminUser.passwordHash,
    adminUser.firstName, adminUser.lastName, adminUser.role, adminUser.isActive,
    1, 0, 0, 0, 0, 0, 0, adminUser.createdAt, adminUser.updatedAt
  ]);

  for (const student of students) {
    await db.execute(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, level, xp, current_sat_score, target_sat_score, streak_days, total_games_played, total_games_won, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      student.id, student.username, student.email, student.passwordHash,
      student.firstName, student.lastName, student.role, student.isActive,
      student.level, student.xp, student.currentSatScore, student.targetSatScore,
      student.streakDays, student.totalGamesPlayed, student.totalGamesWon,
      student.createdAt, student.updatedAt
    ]);
  }

  // Create sample SAT questions
  const sampleQuestions = [
    {
      id: 1,
      category: 'mathematics',
      subcategory: 'algebra',
      difficulty: 'easy',
      questionText: 'If 2x + 5 = 13, what is the value of x?',
      options: JSON.stringify(['3', '4', '5', '6']),
      correctAnswer: '4',
      explanation: 'Solve for x: 2x + 5 = 13, so 2x = 8, therefore x = 4.',
      timeLimit: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      category: 'mathematics',
      subcategory: 'problem_solving',
      difficulty: 'medium',
      questionText: 'What is 25% of 80?',
      options: JSON.stringify(['15', '20', '25', '30']),
      correctAnswer: '20',
      explanation: '25% of 80 = 0.25 × 80 = 20.',
      timeLimit: 45,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      category: 'reading_writing',
      subcategory: 'vocabulary',
      difficulty: 'easy',
      questionText: 'The word "meticulous" in the sentence "She was meticulous about her research" most nearly means:',
      options: JSON.stringify(['Careless', 'Careful and thorough', 'Quick', 'Confused']),
      correctAnswer: 'Careful and thorough',
      explanation: 'Meticulous means showing great attention to detail; being very careful and precise.',
      timeLimit: 45,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      category: 'mathematics',
      subcategory: 'geometry',
      difficulty: 'hard',
      questionText: 'A circle has a radius of 5 units. What is the area of the circle?',
      options: JSON.stringify(['25π', '10π', '5π', '50π']),
      correctAnswer: '25π',
      explanation: 'Area of a circle = πr². With r = 5, Area = π(5)² = 25π.',
      timeLimit: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      category: 'reading_writing',
      subcategory: 'grammar',
      difficulty: 'medium',
      questionText: 'Which choice best combines the sentences at the underlined portion? "The library was quiet. Students were studying for exams."',
      options: JSON.stringify(['quiet, students', 'quiet; students', 'quiet because students', 'quiet, and students']),
      correctAnswer: 'quiet, and students',
      explanation: 'The coordinating conjunction "and" with a comma correctly joins two independent clauses.',
      timeLimit: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert questions
  const questions = [];
  for (const question of sampleQuestions) {
    await db.execute(`
      INSERT INTO questions (id, category, subcategory, difficulty, question_text, options, correct_answer, explanation, time_limit, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      question.id, question.category, question.subcategory, question.difficulty,
      question.questionText, question.options, question.correctAnswer,
      question.explanation, question.timeLimit, question.isActive,
      question.createdAt, question.updatedAt
    ]);
    questions.push(question);
  }

  // Create sample daily challenges
  const dailyChallenge = {
    id: 1,
    title: 'Daily SAT Practice',
    description: 'Complete 5 questions from various SAT categories',
    category: 'mixed',
    difficulty: 'medium',
    questions: JSON.stringify([1, 2, 3, 4, 5]),
    timeLimit: 300,
    rewards: JSON.stringify({ xp: 100, streak: 1 }),
    isActive: true,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.execute(`
    INSERT INTO daily_challenges (id, title, description, category, difficulty, questions, time_limit, rewards, is_active, date, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    dailyChallenge.id, dailyChallenge.title, dailyChallenge.description,
    dailyChallenge.category, dailyChallenge.difficulty, dailyChallenge.questions,
    dailyChallenge.timeLimit, dailyChallenge.rewards, dailyChallenge.isActive,
    dailyChallenge.date, dailyChallenge.createdAt, dailyChallenge.updatedAt
  ]);

  // Create sample battle royale game
  const battleGame = {
    id: 1,
    hostId: 2,
    maxPlayers: 10,
    currentPlayers: 3,
    status: 'waiting',
    questions: JSON.stringify([1, 2, 3, 4, 5]),
    settings: JSON.stringify({
      timePerQuestion: 60,
      eliminationRate: 0.2,
      powerUpsEnabled: true
    }),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.execute(`
    INSERT INTO battle_royale_games (id, host_id, max_players, current_players, status, questions, settings, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    battleGame.id, battleGame.hostId, battleGame.maxPlayers, battleGame.currentPlayers,
    battleGame.status, battleGame.questions, battleGame.settings,
    battleGame.createdAt, battleGame.updatedAt
  ]);

  // Create sample squad
  const squad = {
    id: 1,
    name: 'SAT Warriors',
    description: 'Elite SAT prep squad',
    leaderId: 2,
    maxMembers: 4,
    currentMembers: 2,
    totalXp: 1500,
    averageScore: 1350,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.execute(`
    INSERT INTO squads (id, name, description, leader_id, max_members, current_members, total_xp, average_score, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    squad.id, squad.name, squad.description, squad.leaderId, squad.maxMembers,
    squad.currentMembers, squad.totalXp, squad.averageScore, squad.isActive,
    squad.createdAt, squad.updatedAt
  ]);

  // Add squad members
  await db.execute(`
    INSERT INTO squad_members (id, squad_id, user_id, role, is_active, joined_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [1, 1, 2, 'leader', true, new Date()]);

  await db.execute(`
    INSERT INTO squad_members (id, squad_id, user_id, role, is_active, joined_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [2, 1, 3, 'member', true, new Date()]);

  // Create sample leads
  const leads = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '555-0123',
      school: 'Lincoln High School',
      graduationYear: 2025,
      status: 'new',
      source: 'website',
      notes: 'Interested in SAT prep for college admission',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '555-0456',
      school: 'Washington High School',
      graduationYear: 2025,
      status: 'contacted',
      source: 'referral',
      notes: 'Parent inquiry about SAT improvement',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const lead of leads) {
    await db.execute(`
      INSERT INTO leads (id, first_name, last_name, email, phone, school, graduation_year, status, source, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      lead.id, lead.firstName, lead.lastName, lead.email, lead.phone,
      lead.school, lead.graduationYear, lead.status, lead.source,
      lead.notes, lead.createdAt, lead.updatedAt
    ]);
  }

  console.log('✅ Database seeding completed successfully!');
  
  return {
    adminUser,
    students,
    questions,
    dailyChallenge,
    battleGame,
    squad,
    leads
  };
}