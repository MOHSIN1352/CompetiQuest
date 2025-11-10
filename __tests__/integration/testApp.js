import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Create test app without database connection
export const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Mock routes for testing
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Mock auth routes
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    res.status(201).json({
      _id: 'mock-user-id',
      username,
      email,
      role: 'user'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'testuser' && password === 'password123') {
      res.status(200).json({
        _id: 'mock-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/validate', (req, res) => {
    res.status(200).json({ user: { id: 'mock-user-id', username: 'testuser' } });
  });

  // Mock user routes
  app.get('/api/users/profile', (req, res) => {
    res.status(200).json({
      _id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com'
    });
  });

  app.put('/api/users/profile', (req, res) => {
    res.status(200).json({
      _id: 'mock-user-id',
      username: req.body.username || 'testuser',
      email: req.body.email || 'test@example.com'
    });
  });

  // Mock quiz routes
  app.post('/api/quiz/start', (req, res) => {
    res.status(200).json({
      _id: 'mock-quiz-id',
      user: 'mock-user-id',
      topic: req.body.topicId,
      questions: ['q1', 'q2', 'q3'],
      startTime: new Date()
    });
  });

  app.post('/api/quiz/submit', (req, res) => {
    res.status(200).json({
      _id: 'mock-quiz-id',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      passed: true
    });
  });

  // Mock categories routes
  app.get('/api/categories', (req, res) => {
    res.status(200).json([
      { _id: 'cat1', name: 'Programming', description: 'Programming topics' },
      { _id: 'cat2', name: 'Mathematics', description: 'Math topics' }
    ]);
  });

  app.post('/api/categories', (req, res) => {
    res.status(201).json({
      _id: 'new-cat-id',
      name: req.body.name,
      description: req.body.description
    });
  });

  // Mock topics routes
  app.get('/api/topics', (req, res) => {
    res.status(200).json([
      { _id: 'topic1', name: 'JavaScript', category: 'cat1' },
      { _id: 'topic2', name: 'Python', category: 'cat1' }
    ]);
  });

  app.post('/api/topics', (req, res) => {
    res.status(201).json({
      _id: 'new-topic-id',
      name: req.body.name,
      category: req.body.category
    });
  });

  // Mock questions routes
  app.get('/api/questions', (req, res) => {
    res.status(200).json([
      {
        _id: 'q1',
        question: 'What is JavaScript?',
        options: ['Language', 'Framework', 'Library', 'Database'],
        correctOptionIndex: 0,
        difficulty: 'Easy'
      }
    ]);
  });

  app.post('/api/questions', (req, res) => {
    res.status(201).json({
      _id: 'new-question-id',
      question: req.body.question,
      options: req.body.options,
      correctOptionIndex: req.body.correctOptionIndex,
      difficulty: req.body.difficulty
    });
  });

  return app;
};