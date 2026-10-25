# MathQuest AI — Gamified AI-Powered Mathematics Platform
### Task 1: Full-Stack Developer Assessment (Grades 5 & 6)
**Georgia Mathematics Standards Aligned (GSE & K-12 Standards)**

---

## 1. Project Overview

**MathQuest AI** is a production-quality, gamified, AI-powered mathematics learning platform engineered for **Grade 5 and Grade 6 students**. The platform aligns directly with the official **Georgia Mathematics Standards**, guiding young learners through differentiated mathematical quests in **Fractions**, **Decimals**, **Ratios & Proportions**, and **Geometry**.

The application combines:
1. **Real Groq AI Pedagogical Explanations**: Structured, child-friendly conceptual breakdowns, analogies, and step-by-step worked examples validated with **Zod** and deterministic math checking.
2. **Dynamic Adaptive Quiz Engine**: Diagnostic practice system with real-time difficulty tuning (Easy $\leftrightarrow$ Medium $\leftrightarrow$ Hard) reacting adaptively to consecutive answer streaks.
3. **Gamification & Rewards Engine**: Granular XP calculation, 5-tier level progression, and 6 curriculum milestone badges with strict anti-farming controls.
4. **Interactive Multimedia**: Genuine AI-generated educational infographic for Equivalent Fractions and a synchronized video-style narrated slide presentation using the Web Speech Synthesis API.
5. **Real MongoDB Persistence**: Local database storing student profiles, lesson cache, quiz attempts, rolling accuracy, and unlocked achievements with zero fabricated statistics.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS with custom educational palette (Purple `#7C3AED`, Teal `#0D9488`, Amber `#F59E0B`)
- **Icons**: Lucide React
- **Routing**: React Router v7 with protected routes
- **HTTP Client**: Axios with JWT Bearer request interceptors
- **Visual Analytics**: Recharts (for student quiz accuracy & performance trend curves)
- **Speech Synthesis**: Web Speech API (`window.speechSynthesis`) for interactive narration

### Backend
- **Runtime**: Node.js & Express.js
- **Database ODM**: Mongoose v8/v9
- **Authentication**: JWT & bcryptjs password hashing (salt rounds: 10)
- **AI Engine**: Groq SDK (`groq-sdk`) with configurable model (`openai/gpt-oss-20b`)
- **Validation**: Zod schema validation & express-validator
- **Security & Protection**: Helmet headers, express-rate-limit, and strict CORS whitelist

### Database
- **Local MongoDB Server**: Port 27017
- **Database Name**: `mathquest_ai`
- **Management GUI**: MongoDB Compass

---

## 3. Project Architecture & Complete Folder Structure

```
mathquest-ai/
├── backend/
│   ├── config/
│   │   └── db.js                       # Mongoose connection & lifecycle handling
│   ├── controllers/
│   │   ├── aiController.js             # Groq lesson generation, caching, & lesson completion
│   │   ├── authController.js           # Student register, login, & auth verification
│   │   ├── quizController.js           # Adaptive quiz sessions, answer evaluation, & history
│   │   ├── topicController.js          # Topic retrieval with grade & category filtering
│   │   └── userController.js           # Student dashboard aggregation, XP, & Recharts data
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT Bearer token route protection
│   │   ├── errorHandler.js             # Centralized JSON error response handler
│   │   └── rateLimitMiddleware.js      # Auth (30 req/15m) & general API rate limiters
│   ├── models/
│   │   ├── Achievement.js              # Achievement badge schema
│   │   ├── Lesson.js                   # Lesson content, key concepts, worked examples schema
│   │   ├── Progress.js                 # Student topic mastery, accuracy, & completion schema
│   │   ├── Quiz.js                     # Quiz questions & points schema
│   │   ├── QuizAttempt.js              # Quiz attempt session, answers, & difficulty trail
│   │   ├── Topic.js                    # Georgia Standard topic curriculum schema
│   │   └── User.js                     # Student user model (passwordHash excluded from JSON)
│   ├── routes/
│   │   ├── aiRoutes.js                 # /api/ai (generate-lesson, complete-lesson)
│   │   ├── authRoutes.js               # /api/auth (register, login, me)
│   │   ├── quizRoutes.js               # /api/quizzes (generate, start, answer, result, history)
│   │   ├── topicRoutes.js              # /api/topics (list, get by id/slug)
│   │   └── userRoutes.js               # /api/users (dashboard)
│   ├── services/
│   │   ├── gamificationService.js      # Level calculations, XP awards, & badge evaluation
│   │   └── groqService.js              # Reusable Groq SDK client with JSON mode
│   ├── utils/
│   │   ├── mathValidator.js            # Deterministic math checking & verified fallbacks
│   │   ├── schemas.js                  # Zod validation schemas for AI lesson & quiz generation
│   │   ├── seedData.js                 # Georgia Mathematics curriculum standards metadata
│   │   └── seeder.js                   # Seeder script & auto-seed verification
│   ├── test-phase1.js                  # Phase 1 test suite (31 tests)
│   ├── test-groq.js                    # Groq API live integration test
│   ├── test-master.js                  # Master test suite for Phases 1–5 (42 tests)
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js                       # Express app entry with security, CORS & routing
├── frontend/
│   ├── public/
│   │   └── infographics/
│   │       ├── equivalent-fractions-infographic.png # AI-generated math infographic
│   │       └── equivalent-fractions-infographic.jpg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Footer.jsx          # Educational footer with working links
│   │   │   │   ├── Logo.jsx            # Mathematical branding badge
│   │   │   │   ├── Navbar.jsx          # Responsive header with XP badge & mobile drawer
│   │   │   │   ├── ProtectedRoute.jsx  # Route guard for authenticated student pages
│   │   │   │   └── VideoLessonModal.jsx# Narrated video-style slide presentation player
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx # Mission Control layout with sidebar
│   │   │   │   └── MainLayout.jsx      # Public layout with Navbar & Footer
│   │   │   └── ui/
│   │   │       ├── Badge.jsx           # Color-coded badge pills
│   │   │       ├── Button.jsx          # Bouncy, child-friendly 3D shadow buttons
│   │   │       ├── Card.jsx            # Rounded cards with soft shadows
│   │   │       ├── Input.jsx           # Accessible input fields with icons & validation
│   │   │       └── Skeleton.jsx        # Loading placeholders
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx         # React auth context for JWT session persistence
│   │   ├── hooks/
│   │   │   └── useAuth.js              # Custom auth hook
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx       # Student mission control with Recharts analytics
│   │   │   ├── LandingPage.jsx         # "Make Math an Adventure!" landing page
│   │   │   ├── LoginPage.jsx           # Student login screen
│   │   │   ├── NotFoundPage.jsx        # 404 handler
│   │   │   ├── QuizRunnerPage.jsx      # Adaptive quiz player with instant feedback
│   │   │   ├── RegisterPage.jsx        # Student registration (Grade 5/6 selector)
│   │   │   ├── TopicDetailPage.jsx     # AI lesson explorer with infographic & video modal
│   │   │   └── TopicsPage.jsx          # Grade 5 & 6 Georgia curriculum paths
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT interceptor & API endpoints
│   │   ├── utils/
│   │   │   ├── cn.js                   # Tailwind class merger
│   │   │   └── formatters.js           # XP, level, and difficulty formatting helpers
│   │   ├── App.jsx                     # Route configuration
│   │   ├── index.css                   # Tailwind styles, Fredoka font, animations
│   │   └── main.jsx                    # React 18 bootstrap
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                     # Vercel deployment configuration
│   └── vite.config.js
├── candidate_details.txt               # Candidate assessment submission details
├── render.yaml                         # Render deployment configuration
├── .gitignore
└── README.md
```

---

## 4. Installation & Local Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.22.0)
- **Local MongoDB Server**: Running locally on `mongodb://localhost:27017`
- **MongoDB Compass**: For inspecting collections and documents

### 1. Backend Installation & Seeding
```bash
cd mathquest-ai/backend
npm install
npm run seed      # Seeds 8 Georgia Mathematics Standards topics into MongoDB
```

### 2. Frontend Installation
```bash
cd mathquest-ai/frontend
npm install
```

---

## 5. Environment Variables Configuration

### Backend (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mathquest_ai
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
JWT_SECRET=mq_super_secure_jwt_secret_dev_2026_gamified_math
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

*(Note: Secrets and API keys are never exposed to the frontend).*

---

## 6. Running the Application

### Start the Backend Server:
```bash
cd mathquest-ai/backend
npm run dev       # Starts development server on port 5000
```
Health Check: `http://localhost:5000/api/health`

### Start the Frontend Server:
```bash
cd mathquest-ai/frontend
npm run dev       # Starts Vite dev server on http://localhost:5173
```
Access the application at: `http://localhost:5173`

---

## 7. MongoDB Connection & Compass Setup

1. Launch **MongoDB Compass**.
2. Connect to URI: `mongodb://localhost:27017`
3. Click **Connect**.
4. Open the `mathquest_ai` database.
5. The 7 collections available:
   - `users`: Student accounts with hashed passwords and total XP.
   - `topics`: Georgia Standards curriculum metadata.
   - `lessons`: Cached AI-generated and fallback lessons.
   - `quizzes`: Quiz question pools.
   - `quizattempts`: Interactive quiz sessions, answers, and difficulty trails.
   - `progresses`: Student topic mastery, accuracy %, and completion counters.
   - `achievements`: Unlocked badges per student.

---

## 8. AI Learning & Multimedia Workflows

### 8.1 Groq AI Lesson Generation Workflow
1. The student selects a topic (e.g., Grade 5 Fractions: `5.NR.3`).
2. The backend validates the grade-topic alignment against MongoDB.
3. Checks MongoDB for a cached lesson:
   - If cached, returns immediately in `< 50ms`.
   - If not cached, constructs a Georgia Standards prompt and invokes the Groq API (`openai/gpt-oss-20b`).
4. The output is validated strictly against the `lessonGenerationSchema` with **Zod**.
5. Deterministic arithmetic checks verify worked examples.
6. The validated lesson is saved in MongoDB and rendered with expandable solutions and practice tips.
7. If Groq encounters rate limits or errors, a verified Georgia Standards fallback lesson is served smoothly without breaking the student experience.

### 8.2 AI-Generated Infographic Workflow
- **Topic**: Grade 5 — Equivalent Fractions (`5.NR.3`).
- **Generated Asset**: Created via an AI image-generation tool, illustrating $1/2 = 2/4 = 4/8$ with visual fraction bars, pie charts, and $\times 2$ scale factors.
- **Storage**: Saved as persistent static asset in `frontend/public/infographics/equivalent-fractions-infographic.png`.
- **Display**: Embedded in the Grade 5 Fractions lesson with zoomable lightbox and alternative text.

### 8.3 Narrated Video-Style Presentation Workflow
- **Topic**: Understanding Fractions.
- **Player**: 5-slide interactive player with animated visual fraction bars and formula solvers.
- **Narration**: Browser Web Speech Synthesis API (`window.speechSynthesis`) reading customized pedagogical scripts.
- **Controls**: Play/Pause, Restart, Next/Previous Slide, and Mute audio controls.

---

## 9. Adaptive Quiz Algorithm & Scoring

### 9.1 Adaptive Algorithm Rules
Every quiz starts at **Medium** difficulty:
- **Two consecutive correct answers**: Difficulty increases by one level (`Easy` $\rightarrow$ `Medium` $\rightarrow$ `Hard`).
- **Two consecutive incorrect answers**: Difficulty decreases by one level (`Hard` $\rightarrow$ `Medium` $\rightarrow$ `Easy`).
- When the answer pattern changes (e.g. from correct to incorrect), the consecutive streak resets.
- Correct answers are kept strictly secret on the backend until the student submits an answer.
- Repeat answer submissions for the same question are rejected to prevent XP farming.

### 9.2 Scoring & XP
- **Easy Correct**: 10 XP / points
- **Medium Correct**: 20 XP / points
- **Hard Correct**: 30 XP / points
- **Incorrect**: 0 XP
- **Verified Lesson Completion**: 15 XP (awarded once upon first completion)

### 9.3 Level Progression Tiers
- **Level 1**: 0–99 XP (Novice Cadet)
- **Level 2**: 100–249 XP (Math Apprentice)
- **Level 3**: 250–449 XP (Equation Explorer)
- **Level 4**: 450–699 XP (Georgia Math Champion)
- **Level 5**: 700+ XP (Master Mathematician)

### 9.4 Achievement Badges
- `FIRST_STEPS`: Complete the first lesson.
- `MATH_STARTER`: Complete the first practice quiz.
- `PERFECT_SCORE`: Score 100% accuracy on a quiz.
- `FRACTION_HERO`: Complete the fractions curriculum milestone.
- `QUIZ_CHAMPION`: Complete five quizzes.
- `MATH_EXPLORER`: Study multiple distinct math topics.

---

## 10. Automated Testing Suite

The repository contains automated test suites that run against the live Express backend and MongoDB server:

### Run Master Verification Suite (Phases 1–5):
```bash
cd mathquest-ai/backend
node test-master.js
```
**Results: 42/42 Verification Tests Passing**
- Health check & Groq client configuration verified
- Student registration & JWT auth verified
- Georgia Standards topic separation verified (Ratios strictly for Grade 6)
- Groq AI lesson generation with Zod validation verified
- MongoDB lesson caching verified
- First lesson completion (+15 XP) and `FIRST_STEPS` badge verified
- Adaptive quiz session creation with secret answers verified
- Dynamic difficulty adjustment verified
- Duplicate answer submission prevention verified
- Final quiz score, accuracy %, and XP calculation verified
- Student dashboard real-data aggregation and Recharts trend array verified
- AI-generated educational infographic asset verified

---

## 11. Deployment Instructions & Production Infrastructure

### Target Platforms
- **Frontend**: [Vercel](https://vercel.com) (configured via `frontend/vercel.json`)
- **Backend**: [Render](https://render.com) (configured via `render.yaml`)

### Critical Deployment Architecture Notice:
> [!IMPORTANT]
> A backend hosted on Render runs in a remote cloud container and **cannot** connect to `mongodb://localhost:27017` on a developer's local machine.
> 
> Per assessment specifications:
> - Local development runs entirely against local MongoDB on `mongodb://localhost:27017/mathquest_ai`.
> - Do **not** silently configure production to use local databases.
> - For a live hosted deployment, a dedicated, publicly accessible MongoDB service (e.g. self-hosted MongoDB container or managed MongoDB cluster) must be supplied via the `MONGODB_URI` environment variable in the Render dashboard.
> - In the absence of a hosted database service, local development is 100% functional, and hosted deployment is marked as blocked pending production database provisioning.

---

## 12. Assessment Submission Deliverables

### Packaging Instructions:
To package the project for assessment submission:
```bash
# From workspace root
zip -r FullName_RegisterNumber_Task1.zip mathquest-ai \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/.env" \
  -x "*/dist/*" \
  -x "*/.DS_Store"
```

### Files Included in Submission:
1. `candidate_details.txt` (Candidate information placeholder)
2. `FullName_Resume.pdf` (Please supply your resume PDF alongside the package)
3. Full source code for `frontend/` and `backend/`
4. All verified Georgia Mathematics curriculum topics and seed scripts
5. AI-generated infographic asset in `frontend/public/infographics/`
