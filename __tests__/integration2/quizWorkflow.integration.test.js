import { describe, test, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../setup/testApp.js';
import { setupTestDB, closeTestDB, clearTestDB } from '../setup/testDatabase.js';
import { createTestUser, getAuthCookie, setupTopicWithQuestions } from '../helpers/testHelpers.js';
import Question from '../../Models/QuestionModel.js';
import QuizAttempt from '../../Models/QuizModel.js';

const app = createTestApp();

describe('Complete Quiz Workflow Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Complete Quiz Flow: Start → Submit → View Results', () => {
    test('User completes full quiz: start → answer → submit → view results', async () => {
      // Setup: Create topic with questions
      const topic = await setupTopicWithQuestions(5);
      const { token, user } = await createTestUser();

      // Step 1: Start a quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 5,
          difficulty: 'easy'
        })
        .expect(201);

      expect(startResponse.body).toHaveProperty('quizAttemptId');
      expect(startResponse.body).toHaveProperty('questions');
      expect(startResponse.body).toHaveProperty('topic');
      expect(startResponse.body.questions.length).toBe(5);
      
      // Verify questions don't have correct answers exposed
      startResponse.body.questions.forEach(question => {
        expect(question).not.toHaveProperty('correctOptionIndex');
      });

      const quizAttemptId = startResponse.body.quizAttemptId;

      // Step 2: Submit quiz answers (all correct)
      const submitResponse = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: quizAttemptId,
          answers: [
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 1 }  // Correct
          ]
        })
        .expect(200);

      expect(submitResponse.body).toHaveProperty('score');
      expect(submitResponse.body).toHaveProperty('percentage');
      expect(submitResponse.body).toHaveProperty('totalQuestions');
      expect(submitResponse.body).toHaveProperty('questions');
      expect(submitResponse.body.score).toBe(5);
      expect(submitResponse.body.percentage).toBe(100);
      expect(submitResponse.body.totalQuestions).toBe(5);
      
      // Verify answers are marked correctly
      submitResponse.body.questions.forEach(q => {
        expect(q.is_correct).toBe(true);
        expect(q).toHaveProperty('correct_option_index');
      });

      // Step 3: View quiz attempt details
      const attemptResponse = await request(app)
        .get(`/api/quiz/attempt/${quizAttemptId}`)
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(attemptResponse.body).toHaveProperty('score');
      expect(attemptResponse.body).toHaveProperty('percentage');
      expect(attemptResponse.body).toHaveProperty('topic');
      expect(attemptResponse.body).toHaveProperty('questions');
      expect(attemptResponse.body.score).toBe(5);
      expect(attemptResponse.body.percentage).toBe(100);

      // Step 4: View quiz history
      const historyResponse = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(historyResponse.body).toHaveProperty('quizAttempts');
      expect(historyResponse.body).toHaveProperty('total');
      expect(historyResponse.body).toHaveProperty('totalPages');
      expect(historyResponse.body).toHaveProperty('currentPage');
      expect(historyResponse.body.quizAttempts.length).toBeGreaterThan(0);
      expect(historyResponse.body.quizAttempts[0].score).toBe(5);

      // Step 5: View user quiz statistics
      const statsResponse = await request(app)
        .get('/api/quiz/stats')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(statsResponse.body).toHaveProperty('totalAttempts');
      expect(statsResponse.body).toHaveProperty('averageScore');
      expect(statsResponse.body).toHaveProperty('averagePercentage');
      expect(statsResponse.body).toHaveProperty('bestScore');
      expect(statsResponse.body).toHaveProperty('bestPercentage');
      expect(statsResponse.body.totalAttempts).toBe(1);
      expect(statsResponse.body.averageScore).toBe(5);
      expect(statsResponse.body.bestScore).toBe(5);
      expect(statsResponse.body.bestPercentage).toBe(100);
    });

    test('User submits quiz with wrong answers', async () => {
      const topic = await setupTopicWithQuestions(3);
      const { token } = await createTestUser();

      // Start quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 3
        })
        .expect(201);

      // Submit with all wrong answers
      const submitResponse = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [
            { selected_option_index: 0 }, // Wrong
            { selected_option_index: 0 }, // Wrong
            { selected_option_index: 0 }  // Wrong
          ]
        })
        .expect(200);

      expect(submitResponse.body.score).toBe(0);
      expect(submitResponse.body.percentage).toBe(0);
      expect(submitResponse.body.questions[0].is_correct).toBe(false);
    });

    test('User submits quiz with mixed answers', async () => {
      const topic = await setupTopicWithQuestions(4);
      const { token } = await createTestUser();

      // Start quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 4
        })
        .expect(201);

      // Submit with mixed answers (2 correct, 2 wrong)
      const submitResponse = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 0 }, // Wrong
            { selected_option_index: 1 }, // Correct
            { selected_option_index: 0 }  // Wrong
          ]
        })
        .expect(200);

      expect(submitResponse.body.score).toBe(2);
      expect(submitResponse.body.percentage).toBe(50);
      expect(submitResponse.body.totalQuestions).toBe(4);
    });
  });

  describe('Quiz Error Scenarios', () => {
    test('should return 404 if topic not found when starting quiz', async () => {
      const { token } = await createTestUser();
      const fakeTopicId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: fakeTopicId,
          questionCount: 5
        })
        .expect(404);

      expect(response.body.message).toContain('Topic not found');
    });

    test('should return 404 if no questions found', async () => {
      const Category = (await import('../../Models/CategoryModel.js')).default;
      const Topic = (await import('../../Models/TopicModel.js')).default;
      const { token } = await createTestUser();

      const category = await Category.create({ name: 'Empty Category' });
      const topic = await Topic.create({
        name: 'Empty Topic',
        category: category._id
      });

      const response = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 5
        })
        .expect(404);

      expect(response.body.message).toContain('No questions found');
    });

    test('should return 404 if quiz attempt not found when submitting', async () => {
      const { token } = await createTestUser();
      const fakeQuizId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: fakeQuizId,
          answers: [{ selected_option_index: 1 }]
        })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    test('should return 403 if user tries to access another user quiz', async () => {
      const topic = await setupTopicWithQuestions(2);
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      // User1 starts quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(user1.token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 2
        })
        .expect(201);

      // User2 tries to access user1's quiz
      const response = await request(app)
        .get(`/api/quiz/attempt/${startResponse.body.quizAttemptId}`)
        .set('Cookie', getAuthCookie(user2.token))
        .expect(403);

      expect(response.body.message).toContain('Not authorized');
    });

    test('should return 400 if quiz already submitted', async () => {
      const topic = await setupTopicWithQuestions(2);
      const { token } = await createTestUser();

      // Start quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 2
        })
        .expect(201);

      // Submit first time (success)
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [
            { selected_option_index: 1 },
            { selected_option_index: 1 }
          ]
        })
        .expect(200);

      // Try to submit again (should fail)
      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [
            { selected_option_index: 0 },
            { selected_option_index: 0 }
          ]
        })
        .expect(400);

      expect(response.body.message).toContain('already been submitted');
    });
  });

  describe('Quiz with Different Filters', () => {
    test('should start quiz with difficulty filter', async () => {
      const Category = (await import('../../Models/CategoryModel.js')).default;
      const Topic = (await import('../../Models/TopicModel.js')).default;
      const { token } = await createTestUser();

      const category = await Category.create({ name: 'Test Category' });
      const topic = await Topic.create({
        name: 'Test Topic',
        category: category._id
      });

      // Create questions with different difficulties
      await Question.create([
        {
          questionText: 'Easy Question',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'easy',
          topic: topic._id
        },
        {
          questionText: 'Medium Question',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'medium',
          topic: topic._id
        },
        {
          questionText: 'Hard Question',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'hard',
          topic: topic._id
        }
      ]);

      // Start quiz with easy difficulty only
      const response = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 2,
          difficulty: 'easy'
        })
        .expect(201);

      expect(response.body.questions.length).toBeLessThanOrEqual(2);
      // All returned questions should be easy
      response.body.questions.forEach(q => {
        expect(q.difficulty).toBe('easy');
      });
    });
  });
});

