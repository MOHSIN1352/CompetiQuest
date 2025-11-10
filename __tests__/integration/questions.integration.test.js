import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('Questions Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/questions', () => {
    test('should get all questions successfully', async () => {
      const response = await request(app)
        .get('/api/questions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const question = response.body[0];
      expect(question).toHaveProperty('_id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('correctOptionIndex');
      expect(question).toHaveProperty('difficulty');
      expect(Array.isArray(question.options)).toBe(true);
      expect(question.options.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/questions', () => {
    test('should create a new question successfully', async () => {
      const questionData = {
        question: 'What is React?',
        options: ['Library', 'Framework', 'Language', 'Database'],
        correctOptionIndex: 0,
        difficulty: 'Medium',
        topic: 'topic1'
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.question).toBe(questionData.question);
      expect(response.body.options).toEqual(questionData.options);
      expect(response.body.correctOptionIndex).toBe(questionData.correctOptionIndex);
      expect(response.body.difficulty).toBe(questionData.difficulty);
    });
  });

  describe('Question Management Flow', () => {
    test('should complete full question management workflow', async () => {
      // Get initial questions
      const initialResponse = await request(app)
        .get('/api/questions');

      expect(initialResponse.status).toBe(200);
      const initialCount = initialResponse.body.length;

      // Create new question
      const newQuestion = {
        question: 'What is Node.js?',
        options: ['Runtime', 'Database', 'Browser', 'Editor'],
        correctOptionIndex: 0,
        difficulty: 'Easy',
        topic: 'topic2'
      };

      const createResponse = await request(app)
        .post('/api/questions')
        .send(newQuestion);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.question).toBe(newQuestion.question);

      // Verify question was created
      const finalResponse = await request(app)
        .get('/api/questions');

      expect(finalResponse.status).toBe(200);
    });
  });

  describe('Question Filtering', () => {
    test('should handle difficulty filtering', async () => {
      const response = await request(app)
        .get('/api/questions?difficulty=Easy');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should handle topic filtering', async () => {
      const response = await request(app)
        .get('/api/questions?topic=topic1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Question Validation', () => {
    test('should validate question structure', async () => {
      const questions = await request(app).get('/api/questions');
      
      expect(questions.status).toBe(200);
      
      if (questions.body.length > 0) {
        const question = questions.body[0];
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(question.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctOptionIndex).toBeLessThan(question.options.length);
        expect(['Easy', 'Medium', 'Hard']).toContain(question.difficulty);
      }
    });
  });
});