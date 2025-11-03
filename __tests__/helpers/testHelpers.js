import jwt from 'jsonwebtoken';
import User from '../../Models/UserModel.js';

// Create a test user and get auth token
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    ...userData
  };

  const user = await User.create(defaultUser);
  
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '30d' }
  );

  return { user, token };
};

// Create an admin user
export const createTestAdmin = async () => {
  return createTestUser({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
};

// Generate auth cookie string for supertest
export const getAuthCookie = (token) => {
  return `jwt=${token}`;
};

// Helper to setup topic with questions
export const setupTopicWithQuestions = async (questionCount = 3) => {
  const Category = (await import('../../Models/CategoryModel.js')).default;
  const Topic = (await import('../../Models/TopicModel.js')).default;
  const Question = (await import('../../Models/QuestionModel.js')).default;

  const category = await Category.create({
    name: 'Test Category',
    description: 'Test Description'
  });

  const topic = await Topic.create({
    name: 'Test Topic',
    description: 'Test Topic Description',
    category: category._id,
    subjects: ['Math']
  });

  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      questionText: `Test Question ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 1,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      topic: topic._id,
      explanation: `Explanation for question ${i + 1}`
    });
  }

  await Question.create(questions);

  return topic;
};

// Helper to start and submit a quiz (returns the response body)
// Note: This helper assumes the test is using the same app instance
export const formatQuizAnswers = (answers) => {
  return answers.map((selectedOptionIndex) => ({
    selected_option_index: selectedOptionIndex
  }));
};

