# CompetiQuest Backend - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Categories](#categories)
4. [Topics](#topics)
5. [Questions](#questions)
6. [Quizzes](#quizzes)
7. [Admin](#admin)
8. [Test Routes](#test-routes)

---

## 1. Authentication

### *Register User*
- *URL:* /api/auth/register
- *Method:* POST
- *Headers:* None
- *Payload:*
json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

* *Response (201 Created):*

json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user"
}


* *Errors:* 400 for missing fields, 409 for email already exists

---

### *Login User*

* *URL:* /api/auth/login
* *Method:* POST
* *Headers:* None
* *Payload:*

json
{
  "username": "john_doe",
  "password": "password123"
}


* *Response (200 OK):*

json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user"
}


* *Errors:* 401 for invalid username or password

---

### *Logout User*

* *URL:* /api/auth/logout
* *Method:* POST
* *Headers:* None
* *Response (200 OK):*

json
{ "message": "Logged out successfully" }


---

### *Validate Token*

* *URL:* /api/auth/validate
* *Method:* GET
* *Headers:* Authorization: Bearer JWT_TOKEN
* *Response (200 OK):*

json
{ "user": { "_id": "...", "username": "...", "email": "...", "role": "..." } }


---

## 2. Users

*Note:* All protected endpoints require *Authorization Header* (JWT token in cookies)

### *Get User Profile*

* *URL:* /api/users/profile
* *Method:* GET
* *Headers:* Authorization: Bearer JWT_TOKEN (or JWT cookie)
* *Response (200 OK):*

json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "quizHistory": [...]
}


### *Update User Profile*

* *URL:* /api/users/profile
* *Method:* PUT
* *Headers:* Authorization: Bearer JWT_TOKEN (or JWT cookie)
* *Payload:*

json
{
  "username": "new_name",
  "email": "new_email@example.com"
}


* *Response (200 OK):*

json
{
  "_id": "64f123abc...",
  "username": "new_name",
  "email": "new_email@example.com"
}


### *Get User Quiz History*

* *URL:* /api/users/quiz-history
* *Method:* GET
* *Headers:* Authorization: Bearer JWT_TOKEN (or JWT cookie)
* *Response (200 OK):* Array of quiz attempts with populated topic data

json
[
  {
    "_id": "quizAttemptId1",
    "topic": { "name": "JavaScript", "description": "..." },
    "score": 8,
    "percentage": 80,
    "attempted_at": "2024-01-01T00:00:00.000Z"
  }
]


---

## 3. Categories

### *Get All Categories*

* *URL:* /api/categories
* *Method:* GET
* *Headers:* None
* *Response (200 OK):*

json
[
  {
    "_id": "64f123abc...",
    "name": "Programming",
    "description": "All programming topics",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]


### *Get Category By ID*

* *URL:* /api/categories/:id
* *Method:* GET
* *Headers:* None
* *Response (200 OK):* Category object with populated topics

json
{
  "_id": "64f123abc...",
  "name": "Programming",
  "description": "All programming topics",
  "topics": [
    {
      "_id": "64f456def...",
      "name": "JavaScript",
      "description": "JS fundamentals"
    }
  ]
}


---

## 4. Topics

### *Get All Topics*

* *URL:* /api/topics
* *Method:* GET
* *Query Params:* page, limit, search, subject
* *Response (200 OK):*

json
{
  "topics": [
    {
      "_id": "64f456def...",
      "name": "JavaScript",
      "description": "JS fundamentals",
      "category": "64f123abc...",
      "subjects": ["ES6", "DOM", "Async"]
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}


### *Get Topic By ID*

* *URL:* /api/topics/:id
* *Method:* GET
* *Response (200 OK):* Topic object

### *Get Topics By Category ID*

* *URL:* /api/topics/:categoryId
* *Method:* GET
* *Response (200 OK):* Array of topics for the specified category

json
[
  {
    "_id": "64f456def...",
    "name": "JavaScript",
    "description": "JS fundamentals",
    "category": "64f123abc...",
    "subjects": ["ES6", "DOM"]
  }
]


---

## 5. Questions

### *Get All Questions*

* *URL:* /api/questions
* *Method:* GET
* *Query Params:* page, limit, search, difficulty, subjects, sortBy, sortOrder
* *Response (200 OK):*

json
{
  "questions": [
    {
      "_id": "64f789ghi...",
      "questionText": "What is Node.js?",
      "options": ["Library", "Runtime", "Framework", "Database"],
      "correctOptionIndex": 1,
      "topic": "64f456def...",
      "difficulty": "medium",
      "explanation": "Node.js is a JavaScript runtime..."
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}


### *Get Question By ID*

* *URL:* /api/questions/:id
* *Method:* GET
* *Response (200 OK):* Question object

### *Get Questions By Topic ID*

* *URL:* /api/questions/:topicId
* *Method:* GET
* *Query Params:* page, limit
* *Response (200 OK):*

json
{
  "topic": {
    "_id": "64f456def...",
    "name": "JavaScript",
    "description": "JS fundamentals"
  },
  "questions": [...],
  "totalQuestions": 25,
  "totalPages": 3,
  "currentPage": 1
}


---

## 6. Quizzes

### *Generate Quiz (AI-Powered)*

* *URL:* /api/quiz/generate
* *Method:* POST
* *Payload:*

json
{
  "userId": "64f123abc...",
  "topic": "JavaScript",
  "numberOfQuestions": 10,
  "level": "medium"
}


* *Response (200 OK):*

json
{
  "success": true,
  "quizAttemptId": "64f999xyz...",
  "questions": [
    {
      "id": 1,
      "description": "What is a closure in JavaScript?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ],
  "message": "Generated 10 medium level questions about JavaScript"
}


### *Start Quiz (Database Questions)*

* *URL:* /api/quiz/start
* *Method:* POST
* *Headers:* Authorization: Bearer JWT_TOKEN (or JWT cookie)
* *Payload:*

json
{
  "topicId": "64f456def...",
  "questionCount": 10,
  "difficulty": "medium",
  "subjects": ["ES6", "DOM"]
}


* *Response (201 Created):*

json
{
  "quizAttemptId": "64f999xyz...",
  "topic": "JavaScript",
  "questions": [...],
  "totalQuestions": 10
}


### *Submit Quiz*

* *URL:* /api/quiz/submit
* *Method:* POST
* *Payload:*

json
{
  "quizAttemptId": "64f999xyz...",
  "answers": [
    { "selectedOption": 0 },
    { "selectedOption": 2 }
  ]
}


* *Response (200 OK):*

json
{
  "success": true,
  "score": 8,
  "percentage": 80.0,
  "totalQuestions": 10,
  "results": [
    {
      "question": "What is Node.js?",
      "options": [...],
      "userAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true
    }
  ]
}


### *Get User Quiz History*

* *URL:* /api/quiz/history/:userId
* *Method:* GET
* *Query Params:* page, limit
* *Response (200 OK):*

json
{
  "success": true,
  "quizAttempts": [
    {
      "_id": "64f999xyz...",
      "topic": "JavaScript",
      "score": 8,
      "percentage": 80,
      "totalQuestions": 10,
      "status": "completed",
      "attempted_at": "2024-01-01T00:00:00.000Z",
      "completed_at": "2024-01-01T00:15:00.000Z"
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}


### *Get User Quiz Stats*

* *URL:* /api/quiz/stats/:userId
* *Method:* GET
* *Response (200 OK):*

json
{
  "totalAttempts": 15,
  "averageScore": 7.5,
  "averagePercentage": 75.0,
  "bestScore": 10,
  "bestPercentage": 100.0
}


---

## 7. Admin

*All admin endpoints require Authorization header and admin role*

### *Dashboard Stats*

* *URL:* /api/admin/dashboard-stats
* *Method:* GET
* *Headers:* Authorization: Bearer JWT_TOKEN (admin role required)
* *Response (200 OK):*

json
{
  "success": true,
  "stats": {
    "categoriesCount": 5,
    "topicsCount": 25,
    "questionsCount": 150,
    "usersCount": 100
  },
  "recent": {
    "categories": [...],
    "topics": [...],
    "questions": [...]
  }
}


### *Category Management*

#### Create Category
* *URL:* /api/admin/categories
* *Method:* POST
* *Payload:* { "name": "Programming", "description": "..." }

#### Update Category
* *URL:* /api/admin/categories/:id
* *Method:* PUT
* *Payload:* { "name": "Updated Name", "description": "..." }

#### Delete Category
* *URL:* /api/admin/categories/:id
* *Method:* DELETE
* *Response:* Deletes category and all associated topics/questions

### *Topic Management*

#### Create Topic
* *URL:* /api/admin/topics
* *Method:* POST
* *Payload:* { "name": "JavaScript", "description": "...", "category": "categoryId", "subjects": [...] }

#### Get Topics by Category
* *URL:* /api/admin/topics/category/:categoryId
* *Method:* GET

#### Update Topic
* *URL:* /api/admin/topics/:id
* *Method:* PUT

#### Delete Topic
* *URL:* /api/admin/topics/:id
* *Method:* DELETE

### *Question Management*

#### Create Question
* *URL:* /api/admin/questions
* *Method:* POST
* *Payload:*

json
{
  "questionText": "What is Node.js?",
  "options": ["Library", "Runtime", "Framework", "Database"],
  "correctOptionIndex": 1,
  "topic": "topicId",
  "difficulty": "medium",
  "explanation": "Node.js is a JavaScript runtime..."
}


#### Get Questions by Topic
* *URL:* /api/admin/questions/topic/:topicId
* *Method:* GET
* *Query Params:* page, limit

#### Update Question
* *URL:* /api/admin/questions/:id
* *Method:* PUT

#### Delete Question
* *URL:* /api/admin/questions/:id
* *Method:* DELETE

---

## 8. Test Routes

*Public endpoints for testing (no authentication required)*

* *URL:* /api/admin/test/*
* *Methods:* All CRUD operations available without authentication
* *Purpose:* For development and testing purposes
* *Note:* Same functionality as protected admin routes but without auth middleware

---

## Headers Summary

| Header        | Required For         | Description          |
| ------------- | -------------------- | -------------------- |
| Authorization | Protected routes     | Bearer <JWT_TOKEN> (or JWT cookie) |
| Content-Type  | POST/PUT requests    | application/json   |

---

## Authentication Notes

* JWT tokens are stored in HTTP-only cookies for security
* Tokens expire in 30 days
* Admin role required for admin endpoints
* Special admin credentials: username "MyAdmin", password "my-real-secure-password"
* Admin email "admin@competiquest.com" gets admin role automatically

---

## Pagination Query Parameters

* page → page number (default: 1)
* limit → items per page (default: 10)
* search → search term for filtering
* sortBy → field to sort by (default: createdAt)
* sortOrder → asc/desc (default: desc)

---

## Error Response Format

json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}


---

## Health Check

* *URL:* /api/health
* *Method:* GET
* *Response:* { "message": "Server is running", "timestamp": "..." } 1)
* limit → number of results per page (default 10)

---

## Notes

* All POST/PUT endpoints require JSON payloads.
* Admin-only endpoints are protected with admin middleware.
* Quiz answers are only visible to the user who attempted or admin.
