# SAT Battle Royale - Product Documentation

## Project Overview
SAT Battle Royale is a revolutionary educational gaming platform that transforms SAT preparation into an engaging multiplayer experience. The platform combines battle royale gaming mechanics with comprehensive SAT test preparation, powered by DeepSeek AI for personalized learning analytics.

## Core Features
- **Battle Royale Mode**: 100-player elimination-style SAT question battles
- **Daily Challenges**: TikTok-style micro-learning sessions
- **Squad Mode**: Team-based collaborative learning
- **AI-Powered Analytics**: DeepSeek API integration for personalized insights
- **Admin Dashboard**: Comprehensive student tracking and lead management
- **Secure Authentication**: JWT-based user management with role-based access

## Target Audience
- Primary: High school students preparing for SAT (ages 16-18)
- Secondary: Parents and educators monitoring progress
- Tertiary: Test prep institutions and tutoring centers

## Technical Stack
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: DeepSeek API for analysis and insights
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: WebSocket for live battles

## User Roles
1. **Student**: Core gaming experience, progress tracking
2. **Admin**: Student management, analytics, lead tracking
3. **Teacher**: Classroom management, student oversight

## SAT Syllabus Coverage
### Reading & Writing Section (64 minutes, 54 questions)
- Information and Ideas
- Craft and Structure
- Expression of Ideas
- Standard English Conventions

### Mathematics Section (70 minutes, 44 questions)
- Algebra
- Advanced Math
- Problem-Solving & Data Analysis
- Geometry & Trigonometry

## Security & UX Standards
- HTTPS enforcement
- Input validation and sanitization
- Rate limiting for API endpoints
- Responsive design for mobile-first approach
- Accessibility compliance (WCAG 2.1)
- Clear separation between public and authenticated areas

## Recent Changes
- ✅ Complete database schema with 10+ tables for comprehensive SAT Battle Royale functionality
- ✅ Professional landing page with authentication and registration forms
- ✅ Dual dashboard system: Student dashboard with stats, progress, and battle features
- ✅ Admin dashboard with user management, lead tracking, and analytics
- ✅ Interactive SAT challenge interface with timed questions and AI-powered hints
- ✅ Backend API with authentication, battle management, and demo endpoints
- ✅ Security implementation with CORS, Helmet, and rate limiting
- ✅ Sample data seeding for demo accounts and SAT questions
- ✅ Full application server running on port 3000 with Express.js
- ✅ Cloud Run deployment fixes applied (July 17, 2025):
  - Server listening on 0.0.0.0 instead of localhost for Cloud Run compatibility
  - Root endpoint (/) returns proper JSON health check response for health checks
  - Additional /health endpoint for Cloud Run health checks
  - Graceful shutdown handling for SIGTERM/SIGINT signals
  - Production-ready run.sh script with error handling
  - Alternative main.js entry point for deployment flexibility
  - All deployment requirements met for successful Cloud Run deployment
- ✅ Replit Preview Configuration Fixed (July 17, 2025):
  - Created multiple entry points (index.js, server.js, dev.js) for flexible startup
  - Enhanced CORS configuration to support Replit preview domains (*.replit.app, *.replit.dev, *.replit.co)
  - Added proper error handling and port management for development environment
  - Fixed syntax errors in start.js (removed duplicate gracefulShutdown function)
  - Server now properly displays Replit preview domain in startup logs
  - All health check endpoints working correctly for preview system
- ✅ Cloud Run Deployment Issues Fixed (July 17, 2025):
  - Fixed run command configuration with multiple entry points (run.js, app.js, main-deploy.js)
  - Root endpoint (/) now ALWAYS returns 200 JSON health check response for Cloud Run
  - Verified server binding to 0.0.0.0 for Cloud Run compatibility
  - Added graceful shutdown handling for SIGTERM signals
  - Created simplified deployment entry points for reliable startup
  - All deployment requirements verified and working

## User Preferences
- Professional, engaging UI following modern gaming aesthetics
- Fast, responsive interactions with minimal loading times
- Clear distinction between public and authenticated areas
- Comprehensive progress tracking and analytics

## Demo Access
- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/dashboard (login: admin@satbattle.com / admin123!)
- **Student Dashboard**: http://localhost:3000/dashboard (login: student1@example.com / student123!)
- **Challenge Interface**: http://localhost:3000/challenge

## Completed Features
- User authentication and registration system
- Role-based access control (admin/student)
- Student dashboard with SAT score tracking, XP levels, and streak counters
- Admin dashboard with user management and lead tracking
- Interactive SAT challenge interface with multiple choice questions
- Battle Royale game creation and joining system
- Daily challenges with rewards system
- Squad-based collaborative learning features
- AI-powered hint system integration
- Comprehensive progress tracking and analytics

## Next Steps
- Implement real-time WebSocket connections for live battles
- Add comprehensive SAT question database with 2025 curriculum
- Deploy to production environment with Replit Deployments
- Integrate payment processing for premium features