import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('Quiz Workflow Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('Quiz Management', () => {
    test('should start a quiz successfully', async () => {
      const quizData = {
        topicId: 'topic1',
        numberOfQuestions: 10
      };

      const response = await request(app)
        .post('/api/quiz/start')
        .send(quizData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('questions');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body.topic).toBe(quizData.topicId);
    });

    test('should submit quiz successfully', async () => {
      const submissionData = {
        quizId: 'mock-quiz-id',
        answers: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
      };

      const response = await request(app)
        .post('/api/quiz/submit')
        .send(submissionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('totalQuestions');
      expect(response.body).toHaveProperty('percentage');
      expect(response.body).toHaveProperty('passed');
      expect(typeof response.body.score).toBe('number');
      expect(typeof response.body.percentage).toBe('number');
    });
  });

  describe('Complete Quiz Flow', () => {
    test('should complete full quiz taking workflow', async () => {
      // Start quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .send({
          topicId: 'topic1',
          numberOfQuestions: 5
        });

      expect(startResponse.status).toBe(200);
      const quizId = startResponse.body._id;

      // Submit quiz
      const submitResponse = await request(app)
        .post('/api/quiz/submit')
        .send({
          quizId: quizId,
          answers: [0, 1, 2, 0, 1]
        });

      expect(submitResponse.status).toBe(200);
      expect(submitResponse.body.score).toBeGreaterThanOrEqual(0);
      expect(submitResponse.body.totalQuestions).toBeGreaterThan(0);
      expect(submitResponse.body.percentage).toBeGreaterThanOrEqual(0);
      expect(submitResponse.body.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Quiz Data Validation', () => {
    test('should handle quiz start with valid topic', async () => {
      const response = await request(app)
        .post('/api/quiz/start')
        .send({
          topicId: 'valid-topic-id',
          numberOfQuestions: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.topic).toBe('valid-topic-id');
    });

    test('should handle quiz submission with valid data', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          quizId: 'valid-quiz-id',
          answers: [0, 1, 2, 3, 0]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('passed');
    });
  });
});