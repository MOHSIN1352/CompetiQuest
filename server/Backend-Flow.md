# CompetiQuest Backend - End-to-End Logic Flow

## Overview

The CompetiQuest backend is built using *Node.js, **Express 5, and **MongoDB. It provides APIs for user authentication, quiz management, question handling, topic, category, and company management. It supports both **user* and *admin* roles.

Key features include:

- User registration, login, and profile management
- Category and topic management
- Company management
- Question CRUD and retrieval
- Quiz generation, submission, scoring, leaderboard, and user statistics
- Admin-only endpoints for analytics and management

---

## 1. Models

### *User*
- Tracks users, their credentials, role, and quiz history.
- Fields:
  - username, email, password, role (user / admin)
  - quiz_history → references QuizAttempt
- Passwords hashed using bcrypt.
- Role-based authorization handled in middleware.

### *Category*
- Represents a category of quizzes.
- Fields:
  - name (unique)
  - description
  - topics → references Topic

### *Topic*
- Represents a specific topic under a category.
- Fields:
  - name (unique)
  - description
  - subjects → array of strings
- Associated with a category.

### *Company*
- Represents companies for company-based quiz categorization.
- Fields:
  - name (unique)
  - description
  - website
  - created_at

### *Question*
- Stores questions for quizzes.
- Fields:
  - question_text, options, correct_option_index
  - difficulty (easy, medium, hard)
  - subjects → array of strings
- Supports search, filtering, and random sampling.

### *QuizAttempt*
- Tracks each user's quiz attempts.
- Fields:
  - user → references User
  - topic → references Topic
  - questions → array of objects:
    - question_id → references Question
    - selected_option_index, is_correct
  - score, percentage, attempted_at

---

## 2. Routes & Controllers

### *Auth Routes*
- /api/auth/register → register new user
- /api/auth/login → login existing user
- Controller: UserController.js

### *User Routes*
- /api/users/profile → GET/PUT user profile
- /api/users/change-password → update password
- /api/users/quiz-history → get user's quiz attempts
- /api/users/delete → delete user account
- /api/users/all → admin: get all users
- Controller: UserController.js
- Middleware: protect, admin (role-based access)

### *Category Routes*
- /api/categories → CRUD categories
- /api/categories/:id/topics → manage topics under category
- Controller: CategoryController.js
- Middleware: protect, admin

### *Company Routes*
- /api/companies → CRUD companies
- /api/companies/search → search companies
- /api/companies/:id → get/update/delete company by ID
- Controller: CompanyController.js
- Middleware: protect, admin for modifications

### *Topic Routes*
- /api/topics → CRUD topics
- /api/topics/:id/subjects → manage subjects
- /api/topics/search → search topics
- /api/topics/subjects → get all subjects
- Controller: TopicController.js
- Middleware: protect, admin for modifications

### *Question Routes*
- /api/questions → CRUD questions
- /api/questions/search → search questions
- /api/questions/random → get random questions (supports filtering by difficulty and subjects)
- /api/questions/difficulty/:difficulty → filter by difficulty
- /api/questions/subject/:subject → filter by subject
- Controller: QuestionController.js
- Middleware: protect, admin for modifications

### *Quiz Routes*
- /api/quiz/start → generate quiz attempt
- /api/quiz/submit → submit answers and calculate score
- /api/quiz/history → get user quiz history
- /api/quiz/stats → get user statistics (total attempts, average scores, best scores)
- /api/quiz/leaderboard → global leaderboard (supports filtering by topic)
- /api/quiz/attempt/:id → get specific quiz attempt
- /api/quiz/all → admin: get all quiz attempts
- /api/quiz/attempt/:id (DELETE) → delete quiz attempt
- Controller: QuizController.js
- Middleware: protect, admin for restricted endpoints

---

## 3. Backend Logic Flow

### *User Registration & Authentication*
1. User sends POST request to /api/auth/register.
2. Backend validates fields.
3. Password is hashed.
4. User saved to MongoDB.
5. JWT token generated and returned.

Login:
1. POST /api/auth/login with username/password.
2. Password validated using bcrypt.
3. JWT token returned on success.

---

### *Category & Topic Management*
1. Admin creates categories and topics.
2. Topics are linked to categories.
3. Each topic contains subjects (strings) used for question filtering.
4. Subjects can be added/removed dynamically.
5. Endpoints support search and pagination.

---

### *Company Management*
1. Admin creates companies with name, description, and website.
2. Companies support search functionality.
3. Company data can be updated or deleted by admins.
4. Public endpoints allow users to view and search companies.
5. Pagination supported for listing all companies.

---

### *Question Management*
1. Admin creates questions with options, difficulty, subjects.
2. Question can be associated with one or multiple subjects.
3. Random question API (/questions/random) selects questions for quiz creation.
4. Search/filter APIs enable dynamic retrieval by subject or difficulty.

---

### *Quiz Flow*
#### *Start Quiz*
1. User POSTs to /api/quiz/start with topicId, optional difficulty, subjects, questionCount.
2. Backend queries Question collection using filters.
3. Questions sampled randomly using MongoDB's $sample aggregation.
4. QuizAttempt document created with selected_option_index = null for all questions.
5. QuizAttempt ID returned to frontend along with questions (correct answers hidden).

#### *Submit Quiz*
1. User POSTs to /api/quiz/submit with quizAttemptId and answers.
2. Backend verifies user owns attempt.
3. Compares each selected option with correct answer.
4. Updates is_correct and selected_option_index.
5. Calculates score and percentage.
6. Saves QuizAttempt and updates user's quiz_history.

#### *Get Quiz Attempt / History / Stats*
- GET /api/quiz/attempt/:id → fetch single attempt
- GET /api/quiz/history → fetch user's all attempts with pagination
- GET /api/quiz/stats → aggregate statistics per user (total attempts, average score, average percentage, best score, best percentage)
- GET /api/quiz/leaderboard → aggregates highest scores across all users or filtered by topic, showing username, email, and performance metrics

---

### *Middleware*
- *protect* → verifies JWT token
- *admin* → verifies user role
- Applied selectively to routes to restrict access.

---

## 4. Data Relationships

- Each quiz attempt is tied to a single topic and user.
- Each topic belongs to a category.
- Questions can belong to multiple subjects under a topic.

---

## 5. Notes & Considerations
- Passwords are securely hashed with bcrypt.
- JWT tokens expire in 30 days.
- **ES Modules (import/export)** used consistently across all controllers, models, routes, and middleware.
- *Express 5* used with updated syntax (removed wildcard * route pattern for 404 handler).
- Pagination, search, and filtering implemented for all list endpoints.
- Company management fully implemented for company-based categorization.
- All date fields (created_at, updated_at, attempted_at) tracked for audit purposes.

---

## 6. Current Implementation Status

### *Completed Features*
- User authentication with JWT cookies
- Category and topic management (public + admin)
- Question management with full CRUD
- AI-powered quiz generation via Gemini API
- Database-driven quiz system
- Quiz submission and scoring
- User quiz history and statistics
- Admin dashboard with comprehensive CRUD
- Test endpoints for development

### *Architecture Decisions*
- Mixed authentication model (some public, some protected)
- Dual quiz system (AI-generated vs database questions)
- HTTP-only cookies for JWT storage
- Embedded question data for AI quizzes
- Referenced questions for database quizzes
- Cascade deletion for data integrity

### *API Endpoints Summary*
- *8 route files* with distinct responsibilities
- *50+ endpoints* covering all functionality
- *Consistent response format* with success indicators
- *Comprehensive error handling* with proper status codes

---

## 7. Recommended Enhancements

### *Security & Performance*
- Add rate limiting for auth endpoints
- Implement Redis caching for popular questions
- Add request validation middleware (joi/express-validator)
- Implement API key authentication for admin test routes

### *Features*
- Quiz timer functionality with duration tracking
- Leaderboard system with global rankings
- Question difficulty auto-adjustment based on user performance
- Bulk question import/export functionality
- Quiz templates and saved configurations

### *Monitoring & Testing*
- Unit tests for all controllers and models
- Integration tests for API endpoints
- Logging middleware for request tracking
- Health check endpoints with database connectivity
- Performance monitoring and metrics collection

---

## 8. Environment Configuration

### *Required Environment Variables*
env
MONGO_URI=mongodb://localhost:27017/competiquest
JWT_SECRET=your-jwt-secret-key
GEMINI_API_KEY=your-google-gemini-api-key
NODE_ENV=development
PORT=5000


### *Server Configuration*
- *Port*: 5000 (configurable via PORT env var)
- *CORS*: Enabled for localhost:3000 with credentials
- *Body Parser*: JSON middleware enabled
- *Cookie Parser*: Enabled for JWT cookie handling
- *Global Error Handler*: Catches all unhandled errors
- *404 Handler*: Returns JSON error for unknown routes
