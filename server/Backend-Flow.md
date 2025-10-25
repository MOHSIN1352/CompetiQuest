# CompetiQuest Backend - End-to-End Logic Flow

## Overview

The CompetiQuest backend is built using **Node.js**, **Express**, and **MongoDB**. It provides APIs for user authentication, quiz management, question handling, topic and category management. It supports both **user** and **admin** roles.

Key features include:

- User registration, login, and profile management
- Category and topic management
- Question CRUD and retrieval
- Quiz generation, submission, scoring, and leaderboard
- Admin-only endpoints for analytics and management

---

## 1. Models

### **User**
- Tracks users, their credentials, role, and quiz history.
- Fields:
  - `username`, `email`, `password`, `role` (`user` / `admin`)
  - `quiz_history` → references `QuizAttempt`
- Passwords hashed using bcrypt.
- Role-based authorization handled in middleware.

### **Category**
- Represents a category of quizzes.
- Fields:
  - `name` (unique)
  - `description`
  - `topics` → references `Topic`

### **Topic**
- Represents a specific topic under a category.
- Fields:
  - `name` (unique)
  - `description`
  - `subjects` → array of strings
- Associated with a category.

### **Question**
- Stores questions for quizzes.
- Fields:
  - `question_text`, `options`, `correct_option_index`
  - `difficulty` (`easy`, `medium`, `hard`)
  - `subjects` → array of strings
- Supports search, filtering, and random sampling.

### **QuizAttempt**
- Tracks each user's quiz attempts.
- Fields:
  - `user` → references `User`
  - `topic` → references `Topic`
  - `questions` → array of objects:
    - `question_id` → references `Question`
    - `selected_option_index`, `is_correct`
  - `score`, `percentage`, `attempted_at`

---

## 2. Routes & Controllers

### **Auth Routes**
- `/api/auth/register` → register new user
- `/api/auth/login` → login existing user
- Controller: `UserController.js`

### **User Routes**
- `/api/users/profile` → GET/PUT user profile
- `/api/users/change-password` → update password
- `/api/users/quiz-history` → get user's quiz attempts
- `/api/users/delete` → delete user account
- `/api/users/all` → admin: get all users
- Controller: `UserController.js`
- Middleware: `protect`, `admin` (role-based access)

### **Category Routes**
- `/api/categories` → CRUD categories
- `/api/categories/:id/topics` → manage topics under category
- Controller: `CategoryController.js`
- Middleware: `protect`, `admin`

### **Topic Routes**
- `/api/topics` → CRUD topics
- `/api/topics/:id/subjects` → manage subjects
- `/api/topics/search` → search topics
- `/api/topics/subjects` → get all subjects
- Controller: `TopicController.js`
- Middleware: `protect`, `admin` for modifications

### **Question Routes**
- `/api/questions` → CRUD questions
- `/api/questions/search` → search questions
- `/api/questions/random` → get random questions
- `/api/questions/difficulty/:difficulty` → filter by difficulty
- `/api/questions/subject/:subject` → filter by subject
- Controller: `QuestionController.js`
- Middleware: `protect`, `admin` for modifications

### **Quiz Routes**
- `/api/quizzes/start` → generate quiz attempt
- `/api/quizzes/submit` → submit answers and calculate score
- `/api/quizzes/history` → get user quiz history
- `/api/quizzes/stats` → get user statistics
- `/api/quizzes/leaderboard` → global leaderboard
- `/api/quizzes/attempt/:id` → get specific quiz attempt
- `/api/quizzes/all` → admin: get all quiz attempts
- `/api/quizzes/attempt/:id` (DELETE) → delete quiz attempt
- Controller: `QuizController.js`
- Middleware: `protect`, `admin` for restricted endpoints

---

## 3. Backend Logic Flow

### **User Registration & Authentication**
1. User sends POST request to `/api/auth/register`.
2. Backend validates fields.
3. Password is hashed.
4. User saved to MongoDB.
5. JWT token generated and returned.

Login:
1. POST `/api/auth/login` with username/password.
2. Password validated using bcrypt.
3. JWT token returned on success.

---

### **Category & Topic Management**
1. Admin creates categories and topics.
2. Topics are linked to categories.
3. Each topic contains subjects (strings) used for question filtering.
4. Subjects can be added/removed dynamically.
5. Endpoints support search and pagination.

---

### **Question Management**
1. Admin creates questions with options, difficulty, subjects.
2. Question can be associated with one or multiple subjects.
3. Random question API (`/questions/random`) selects questions for quiz creation.
4. Search/filter APIs enable dynamic retrieval by subject or difficulty.

---

### **Quiz Flow**
#### **Start Quiz**
1. User POSTs to `/quizzes/start` with `topicId`, optional `difficulty`, `subjects`, `questionCount`.
2. Backend queries `Question` collection using filters.
3. Questions sampled randomly.
4. QuizAttempt document created with `selected_option_index = null` for all questions.
5. QuizAttempt ID returned to frontend along with questions (correct answers hidden).

#### **Submit Quiz**
1. User POSTs to `/quizzes/submit` with `quizAttemptId` and `answers`.
2. Backend verifies user owns attempt.
3. Compares each selected option with correct answer.
4. Updates `is_correct` and `selected_option_index`.
5. Calculates `score` and `percentage`.
6. Saves QuizAttempt and updates user's `quiz_history`.

#### **Get Quiz Attempt / History / Stats**
- GET `/quizzes/attempt/:id` → fetch single attempt
- GET `/quizzes/history` → fetch user's all attempts
- GET `/quizzes/stats` → aggregate statistics per user (total attempts, avg score, per topic breakdown)
- GET `/quizzes/leaderboard` → aggregates highest scores across all users or filtered by topic

---

### **Middleware**
- **protect** → verifies JWT token
- **admin** → verifies user role
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
- ES Modules (`import/export`) used consistently across controllers.
- Pagination, search, and filtering implemented for all list endpoints.
- Company logic removed for simplicity.
- All date fields (`created_at`, `updated_at`) tracked for audit purposes.

---

## 6. Recommended Enhancements
- Add **rate limiting** for endpoints like `/auth/login`.
- Consider **caching popular questions** for performance.
- Implement **quiz timer logic** if needed.
- Add **unit/integration tests** for all endpoints.

