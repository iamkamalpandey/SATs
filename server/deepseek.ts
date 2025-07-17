import { storage } from './storage';
import { UserAnswer, SatQuestion, User, UserProgress } from '../shared/schema';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PerformanceAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  difficultyTrend: string;
  categoryPerformance: Record<string, number>;
  studyPlan: {
    dailyGoals: string[];
    focusAreas: string[];
    timeAllocation: Record<string, number>;
  };
}

interface QuestionAnalysis {
  conceptsRequired: string[];
  commonMistakes: string[];
  hints: string[];
  difficulty: string;
  timeRecommendation: number;
  explanation: string;
}

export class DeepSeekService {
  private async makeRequest(messages: any[], model: string = 'deepseek-chat'): Promise<DeepSeekResponse> {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeUserPerformance(userId: number): Promise<PerformanceAnalysis> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const answers = await storage.getUserAnswers(userId, 100);
    const progress = await storage.getUserProgress(userId);

    const performanceData = {
      user: {
        level: user.level,
        xp: user.xp,
        currentSatScore: user.currentSatScore,
        targetSatScore: user.targetSatScore,
        streakDays: user.streakDays,
      },
      recentAnswers: answers.slice(0, 50).map(answer => ({
        questionId: answer.questionId,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        hintsUsed: answer.hintsUsed,
        answeredAt: answer.answeredAt,
      })),
      progress: progress.map(p => ({
        category: p.category,
        difficulty: p.difficulty,
        totalQuestions: p.totalQuestions,
        correctAnswers: p.correctAnswers,
        averageTime: p.averageTime,
        masteryLevel: p.masteryLevel,
      })),
    };

    const messages = [
      {
        role: 'system',
        content: `You are an advanced SAT prep AI tutor powered by DeepSeek. Analyze the student's performance data and provide detailed insights for SAT preparation. Focus on:

1. Overall performance assessment
2. Specific strengths and weaknesses
3. Category-wise performance (Reading & Writing vs Mathematics)
4. Difficulty progression analysis
5. Time management patterns
6. Personalized study recommendations
7. Daily study plan suggestions

Provide structured JSON response with specific, actionable insights.`
      },
      {
        role: 'user',
        content: `Please analyze this student's SAT prep performance data and provide comprehensive insights:

${JSON.stringify(performanceData, null, 2)}

Return a structured analysis in JSON format with the following structure:
{
  "overallScore": number (0-100),
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "difficultyTrend": "improving/declining/stable",
  "categoryPerformance": {
    "reading_writing": number (0-100),
    "mathematics": number (0-100)
  },
  "studyPlan": {
    "dailyGoals": ["goal1", "goal2", ...],
    "focusAreas": ["area1", "area2", ...],
    "timeAllocation": {
      "reading_writing": number (minutes),
      "mathematics": number (minutes),
      "practice_tests": number (minutes)
    }
  }
}`
      }
    ];

    const response = await this.makeRequest(messages, 'deepseek-reasoner');
    const analysisText = response.choices[0].message.content;

    try {
      const analysis = JSON.parse(analysisText);
      
      // Save analysis to database
      await storage.saveAiAnalysis({
        userId,
        analysisType: 'performance',
        analysis,
        recommendations: analysis.recommendations,
        confidence: analysis.overallScore / 100,
      });

      return analysis;
    } catch (error) {
      console.error('Failed to parse DeepSeek analysis:', error);
      throw new Error('Failed to analyze performance data');
    }
  }

  async analyzeQuestion(question: SatQuestion): Promise<QuestionAnalysis> {
    const messages = [
      {
        role: 'system',
        content: `You are an expert SAT tutor. Analyze the given SAT question and provide detailed educational insights including:

1. Key concepts and skills required
2. Common mistakes students make
3. Progressive hints for struggling students
4. Difficulty assessment
5. Time recommendation
6. Detailed explanation of the solution

Provide structured JSON response with educational insights.`
      },
      {
        role: 'user',
        content: `Analyze this SAT question:

Category: ${question.category}
Type: ${question.type}
Difficulty: ${question.difficulty}
Question: ${question.question}
${question.options ? `Options: ${JSON.stringify(question.options)}` : ''}
Correct Answer: ${question.correctAnswer}
${question.explanation ? `Explanation: ${question.explanation}` : ''}

Provide analysis in JSON format:
{
  "conceptsRequired": ["concept1", "concept2", ...],
  "commonMistakes": ["mistake1", "mistake2", ...],
  "hints": ["hint1", "hint2", "hint3"],
  "difficulty": "easy/medium/hard",
  "timeRecommendation": number (seconds),
  "explanation": "detailed step-by-step solution"
}`
      }
    ];

    const response = await this.makeRequest(messages, 'deepseek-reasoner');
    const analysisText = response.choices[0].message.content;

    try {
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Failed to parse question analysis:', error);
      throw new Error('Failed to analyze question');
    }
  }

  async generateHint(question: SatQuestion, userAnswer?: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a helpful SAT tutor. Provide a single, progressive hint for the given question. The hint should:
1. Guide the student toward the correct approach
2. Not give away the answer directly
3. Be encouraging and educational
4. Help the student understand the concept

Keep the hint concise and focused.`
      },
      {
        role: 'user',
        content: `Provide a hint for this SAT question:

Question: ${question.question}
${question.options ? `Options: ${JSON.stringify(question.options)}` : ''}
Category: ${question.category}
Difficulty: ${question.difficulty}
${userAnswer ? `Student's current answer: ${userAnswer}` : ''}

Provide a single helpful hint (max 2 sentences).`
      }
    ];

    const response = await this.makeRequest(messages, 'deepseek-chat');
    return response.choices[0].message.content.trim();
  }

  async generatePersonalizedQuestions(userId: number, category: string, difficulty: string, count: number = 5): Promise<number[]> {
    const user = await storage.getUser(userId);
    const progress = await storage.getUserProgress(userId);
    const recentAnswers = await storage.getUserAnswers(userId, 50);

    const userContext = {
      level: user?.level || 1,
      progress: progress.find(p => p.category === category && p.difficulty === difficulty),
      recentMistakes: recentAnswers
        .filter(a => !a.isCorrect)
        .slice(0, 10)
        .map(a => a.questionId),
    };

    // Get available questions
    const availableQuestions = await storage.getSatQuestions(category, difficulty, 100);
    
    // Filter out recently answered questions
    const recentQuestionIds = recentAnswers.slice(0, 20).map(a => a.questionId);
    const filteredQuestions = availableQuestions.filter(q => !recentQuestionIds.includes(q.id));

    // For now, return random selection (in a real implementation, we'd use AI to select optimal questions)
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(q => q.id);
  }

  async analyzeAnswerPattern(userId: number, questionId: number, userAnswer: string, isCorrect: boolean): Promise<any> {
    const user = await storage.getUser(userId);
    const question = await storage.getSatQuestion(questionId);
    const recentAnswers = await storage.getUserAnswers(userId, 20);

    if (!question || !user) {
      throw new Error('Question or user not found');
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI tutor analyzing a student's answer pattern. Provide insights about:
1. The student's reasoning approach
2. Common error patterns
3. Specific recommendations
4. Conceptual understanding level

Be concise and actionable.`
      },
      {
        role: 'user',
        content: `Analyze this student's answer:

Question: ${question.question}
Student Answer: ${userAnswer}
Correct Answer: ${question.correctAnswer}
Is Correct: ${isCorrect}
Question Category: ${question.category}
Question Difficulty: ${question.difficulty}

Student's recent performance:
- Level: ${user.level}
- Recent accuracy: ${recentAnswers.filter(a => a.isCorrect).length}/${recentAnswers.length}

Provide brief analysis (max 3 sentences) about the student's approach and one specific recommendation.`
      }
    ];

    const response = await this.makeRequest(messages, 'deepseek-chat');
    const analysis = response.choices[0].message.content;

    return {
      analysis,
      conceptualUnderstanding: isCorrect ? 'good' : 'needs_improvement',
      recommendation: analysis.split('.').pop()?.trim() || 'Continue practicing similar questions',
    };
  }

  async generateStudyPlan(userId: number, targetScore: number, daysAvailable: number): Promise<any> {
    const user = await storage.getUser(userId);
    const progress = await storage.getUserProgress(userId);
    const recentAnswers = await storage.getUserAnswers(userId, 100);

    const currentPerformance = {
      currentScore: user?.currentSatScore || 0,
      targetScore,
      daysAvailable,
      progress,
      recentAccuracy: recentAnswers.filter(a => a.isCorrect).length / Math.max(recentAnswers.length, 1),
    };

    const messages = [
      {
        role: 'system',
        content: `You are an expert SAT prep strategist. Create a personalized study plan based on the student's current performance and target score. Include:
1. Daily study schedule
2. Focus areas prioritization
3. Practice test schedule
4. Milestone goals
5. Time allocation recommendations

Be specific and realistic.`
      },
      {
        role: 'user',
        content: `Create a personalized SAT study plan:

Current Performance: ${JSON.stringify(currentPerformance, null, 2)}

Generate a structured study plan in JSON format:
{
  "dailySchedule": {
    "totalMinutes": number,
    "breakdown": {
      "reading_writing": number,
      "mathematics": number,
      "practice_tests": number,
      "review": number
    }
  },
  "weeklyGoals": ["goal1", "goal2", ...],
  "focusAreas": ["area1", "area2", ...],
  "milestones": [
    {
      "week": number,
      "target": "milestone description",
      "expectedScore": number
    }
  ],
  "practiceTestSchedule": ["day1", "day2", ...]
}`
      }
    ];

    const response = await this.makeRequest(messages, 'deepseek-reasoner');
    const planText = response.choices[0].message.content;

    try {
      const studyPlan = JSON.parse(planText);
      
      // Save study plan
      await storage.saveAiAnalysis({
        userId,
        analysisType: 'study_plan',
        analysis: studyPlan,
        recommendations: studyPlan.focusAreas,
        confidence: 0.8,
      });

      return studyPlan;
    } catch (error) {
      console.error('Failed to parse study plan:', error);
      throw new Error('Failed to generate study plan');
    }
  }
}

export const deepSeekService = new DeepSeekService();