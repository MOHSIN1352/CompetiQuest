

# CompetiQuest Backend - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Categories](#categories)
4. [Companies](#companies)
5. [Topics](#topics)
6. [Questions](#questions)
7. [Quizzes](#quizzes)

---

## 1. Authentication

### **Register User**
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:** None
- **Payload:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```
* **Response (201 Created):**

```json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "JWT_TOKEN_HERE"
}
```

* **Errors:** `400` for missing fields or email already exists

---

### **Login User**

* **URL:** `/api/auth/login`
* **Method:** `POST`
* **Headers:** None
* **Payload:**

```json
{
  "username": "john_doe",
  "password": "password123"
}
```

* **Response (200 OK):**

```json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "JWT_TOKEN_HERE"
}
```

* **Errors:** `401` for invalid username or password

---

## 2. Users

**Note:** All protected endpoints require **Authorization Header**:
`Authorization: Bearer JWT_TOKEN_HERE`

### **Get User Profile**

* **URL:** `/api/users/profile`
* **Method:** `GET`
* **Response (200 OK):**

```json
{
  "_id": "64f123abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "quiz_history": [...]
}
```

### **Update User Profile**

* **URL:** `/api/users/profile`
* **Method:** `PUT`
* **Payload:**

```json
{
  "username": "new_name",
  "email": "new_email@example.com"
}
```

* **Response (200 OK):**

```json
{
  "_id": "64f123abc...",
  "username": "new_name",
  "email": "new_email@example.com"
}
```

### **Change Password**

* **URL:** `/api/users/change-password`
* **Method:** `PUT`
* **Payload:**

```json
{
  "currentPassword": "old_pass",
  "newPassword": "new_pass"
}
```

* **Response (200 OK):**

```json
{ "message": "Password updated successfully" }
```

### **Get User Quiz History**

* **URL:** `/api/users/quiz-history`
* **Method:** `GET`
* **Response (200 OK):** Array of quiz attempts

```json
[
  {
    "_id": "quizAttemptId1",
    "topic": { "name": "JavaScript" },
    "score": 8,
    "percentage": 80
  },
  ...
]
```

### **Delete User**

* **URL:** `/api/users/delete`
* **Method:** `DELETE`
* **Response (200 OK):**

```json
{ "message": "User account deleted successfully" }
```

### **Get All Users (Admin Only)**

* **URL:** `/api/users/all`
* **Method:** `GET`
* **Response (200 OK):** Array of all users (without passwords)

---

## 3. Categories

**Admin-only actions require Authorization header.**

### **Create Category**

* **URL:** `/api/categories`
* **Method:** `POST`
* **Payload:**

```json
{
  "name": "Programming",
  "description": "All programming topics"
}
```

* **Response (201 Created):** Category object

### **Get All Categories**

* **URL:** `/api/categories`
* **Method:** `GET`
* **Query Params:** `page`, `limit`
* **Response:** Array of categories with pagination info

### **Update Category**

* **URL:** `/api/categories/:id`
* **Method:** `PUT`
* **Payload:** `{ "name": "New Category Name", "description": "Updated" }`

### **Delete Category**

* **URL:** `/api/categories/:id`
* **Method:** `DELETE`
* **Response:** `{ "message": "Category deleted successfully" }`

---

## 4. Companies

**Admin-only actions require Authorization header.**

### **Create Company (Admin)**

* **URL:** `/api/companies`
* **Method:** `POST`
* **Payload:**

```json
{
  "name": "Google",
  "description": "Technology company",
  "website": "https://www.google.com"
}
```

* **Response (201 Created):** Company object

### **Get All Companies**

* **URL:** `/api/companies`
* **Method:** `GET`
* **Query Params:** `page`, `limit`, `search`
* **Response (200 OK):**

```json
{
  "companies": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### **Get Company By ID**

* **URL:** `/api/companies/:id`
* **Method:** `GET`
* **Response (200 OK):** Company object

### **Search Companies**

* **URL:** `/api/companies/search?q=google`
* **Method:** `GET`
* **Response (200 OK):** Array of matching companies (max 10)

### **Update Company (Admin)**

* **URL:** `/api/companies/:id`
* **Method:** `PUT`
* **Payload:**

```json
{
  "name": "Updated Company Name",
  "description": "Updated description",
  "website": "https://updated-url.com"
}
```

* **Response (200 OK):** Updated company object

### **Delete Company (Admin)**

* **URL:** `/api/companies/:id`
* **Method:** `DELETE`
* **Response (200 OK):**

```json
{ "message": "Company deleted successfully" }
```

---

## 5. Topics

### **Create Topic (Admin)**

* **URL:** `/api/topics`
* **Method:** `POST`
* **Payload:**

```json
{
  "name": "JavaScript",
  "description": "JS basics and advanced",
  "subjects": ["ES6", "DOM", "Node.js"]
}
```

### **Get All Topics**

* **URL:** `/api/topics`
* **Method:** `GET`
* **Query Params:** `page`, `limit`, `search`, `subject`
* **Response:** Array of topics with pagination info

### **Add Subject to Topic**

* **URL:** `/api/topics/:id/subjects`
* **Method:** `POST`
* **Payload:**

```json
{ "subject": "React" }
```

### **Remove Subject from Topic**

* **URL:** `/api/topics/:id/subjects`
* **Method:** `DELETE`
* **Payload:**

```json
{ "subject": "React" }
```

### **Search Topics**

* **URL:** `/api/topics/search?q=javascript`
* **Method:** `GET`

### **Get All Subjects**

* **URL:** `/api/topics/subjects`
* **Method:** `GET`

---

## 6. Questions

### **Create Question (Admin)**

* **URL:** `/api/questions`
* **Method:** `POST`
* **Payload:**

```json
{
  "question_text": "What is Node.js?",
  "options": ["Library", "Runtime", "Framework"],
  "correct_option_index": 1,
  "difficulty": "medium",
  "subjects": ["Node.js"]
}
```

### **Get All Questions**

* **URL:** `/api/questions`
* **Method:** `GET`
* **Query Params:** `page`, `limit`, `search`, `difficulty`, `subjects`
* **Response:** Array of questions

### **Get Random Questions**

* **URL:** `/api/questions/random`
* **Method:** `GET`
* **Query Params:** `count`, `difficulty`, `subjects`

### **Search Questions**

* **URL:** `/api/questions/search?q=Node`
* **Method:** `GET`

### **Update Question (Admin)**

* **URL:** `/api/questions/:id`
* **Method:** `PUT`
* **Payload:** Fields to update (text, options, subjects, difficulty)

### **Delete Question (Admin)**

* **URL:** `/api/questions/:id`
* **Method:** `DELETE`

---

## 7. Quizzes

### **Start Quiz**

* **URL:** `/api/quiz/start`
* **Method:** `POST`
* **Payload:**

```json
{
  "topicId": "topicIdHere",
  "questionCount": 10,
  "difficulty": "medium",
  "subjects": ["Node.js"]
}
```

* **Response:** QuizAttempt object with questions (correct answers hidden)

### **Submit Quiz**

* **URL:** `/api/quiz/submit`
* **Method:** `POST`
* **Payload:**

```json
{
  "quizAttemptId": "attemptIdHere",
  "answers": [
    { "selected_option_index": 0 },
    { "selected_option_index": 2 }
  ]
}
```

* **Response:** Score, percentage, correct answers

### **Get Quiz Attempt**

* **URL:** `/api/quiz/attempt/:id`
* **Method:** `GET`

### **Get User Quiz History**

* **URL:** `/api/quiz/history`
* **Method:** `GET`
* **Query Params:** `page`, `limit`

### **Get User Quiz Stats**

* **URL:** `/api/quiz/stats`
* **Method:** `GET`
* **Response (200 OK):**

```json
{
  "totalAttempts": 15,
  "averageScore": 7.5,
  "averagePercentage": 75.0,
  "bestScore": 10,
  "bestPercentage": 100.0
}
```

### **Get Leaderboard**

* **URL:** `/api/quiz/leaderboard`
* **Method:** `GET`
* **Query Params:** `topicId` (optional), `limit` (default: 10)
* **Response (200 OK):**

```json
[
  {
    "userId": "64f123abc...",
    "username": "john_doe",
    "email": "john@example.com",
    "totalAttempts": 20,
    "averageScore": 8.5,
    "averagePercentage": 85.0,
    "bestScore": 10,
    "bestPercentage": 100.0
  },
  ...
]
```

### **Delete Quiz Attempt**

* **URL:** `/api/quiz/attempt/:id`
* **Method:** `DELETE`

### **Get All Quiz Attempts (Admin)**

* **URL:** `/api/quiz/all`
* **Method:** `GET`
* **Query Params:** `user`, `topic`, `page`, `limit`

---

## Headers Summary

| Header        | Required For         | Description          |
| ------------- | -------------------- | -------------------- |
| Authorization | All protected routes | `Bearer <JWT_TOKEN>` |

---

## Pagination Query Parameters

* `page` → page number (default 1)
* `limit` → number of results per page (default 10)

---

## Notes

* All POST/PUT endpoints require JSON payloads.
* Admin-only endpoints are protected with `admin` middleware.
* Quiz answers are only visible to the user who attempted or admin.
