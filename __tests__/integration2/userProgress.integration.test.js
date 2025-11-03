import { describe, test, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../setup/testApp.js';
import { setupTestDB, closeTestDB, clearTestDB } from '../setup/testDatabase.js';
import { createTestUser, getAuthCookie, setupTopicWithQuestions } from '../helpers/testHelpers.js';
import QuizAttempt from '../../Models/QuizModel.js';

const app = createTestApp();

describe('User Progress Tracking Integration Tests', () => {
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

  describe('User takes multiple quizzes and tracks progress', () => {
    test('User takes multiple quizzes and views history with statistics', async () => {
      const { token, user } = await createTestUser();
      
      // Setup: Create topic with 5 questions
      const topic = await setupTopicWithQuestions(5);

      // Take quiz 1: Score 4/5 (80%)
      const start1 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      const quiz1 = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start1.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 0 }] });
      expect(quiz1.body.score).toBe(4);
      expect(quiz1.body.percentage).toBe(80);

      // Take quiz 2: Score 5/5 (100%)
      const start2 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      const quiz2 = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start2.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }] });
      expect(quiz2.body.score).toBe(5);
      expect(quiz2.body.percentage).toBe(100);

      // Take quiz 3: Score 2/5 (40%)
      const start3 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      const quiz3 = await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start3.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 0 }, { selected_option_index: 0 }, { selected_option_index: 0 }] });
      expect(quiz3.body.score).toBe(2);
      expect(quiz3.body.percentage).toBe(40);

      // View quiz history (should show all 3 attempts)
      const historyResponse = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(historyResponse.body).toHaveProperty('quizAttempts');
      expect(historyResponse.body).toHaveProperty('total');
      expect(historyResponse.body).toHaveProperty('totalPages');
      expect(historyResponse.body).toHaveProperty('currentPage');
      expect(historyResponse.body.quizAttempts).toHaveLength(3);
      expect(historyResponse.body.total).toBe(3);

      // Verify attempts are sorted by most recent first
      const attempts = historyResponse.body.quizAttempts;
      expect(attempts[0].score).toBe(2); // Most recent
      expect(attempts[1].score).toBe(5);
      expect(attempts[2].score).toBe(4); // Oldest

      // View statistics
      const statsResponse = await request(app)
        .get('/api/quiz/stats')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(statsResponse.body).toHaveProperty('totalAttempts', 3);
      expect(statsResponse.body).toHaveProperty('averageScore');
      expect(statsResponse.body).toHaveProperty('averagePercentage');
      expect(statsResponse.body).toHaveProperty('bestScore', 5);
      expect(statsResponse.body).toHaveProperty('bestPercentage', 100);
      
      // Average score: (4 + 5 + 2) / 3 = 11/3 ≈ 3.67
      expect(statsResponse.body.averageScore).toBeCloseTo(3.67, 1);
      
      // Average percentage: (80 + 100 + 40) / 3 = 220/3 ≈ 73.33
      expect(statsResponse.body.averagePercentage).toBeCloseTo(73.33, 1);
    });

    test('User views quiz history with pagination', async () => {
      const { token } = await createTestUser();
      const topic = await setupTopicWithQuestions(2);

      // Create 5 quiz attempts
      for (let i = 0; i < 5; i++) {
        const start = await request(app)
          .post('/api/quiz/start')
          .set('Cookie', getAuthCookie(token))
          .send({ topicId: topic._id.toString(), questionCount: 2 });
        await request(app)
          .post('/api/quiz/submit')
          .set('Cookie', getAuthCookie(token))
          .send({ quizAttemptId: start.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }] });
      }

      // Get first page (limit 3)
      const page1Response = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .query({ page: 1, limit: 3 })
        .expect(200);

      expect(page1Response.body.quizAttempts).toHaveLength(3);
      expect(page1Response.body.currentPage).toBe(1);
      expect(page1Response.body.totalPages).toBe(2);
      expect(page1Response.body.total).toBe(5);

      // Get second page
      const page2Response = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .query({ page: 2, limit: 3 })
        .expect(200);

      expect(page2Response.body.quizAttempts).toHaveLength(2);
      expect(page2Response.body.currentPage).toBe(2);
    });

    test('User views empty statistics when no quizzes taken', async () => {
      const { token } = await createTestUser();

      const statsResponse = await request(app)
        .get('/api/quiz/stats')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(statsResponse.body.totalAttempts).toBe(0);
      expect(statsResponse.body.averageScore).toBe(0);
      expect(statsResponse.body.averagePercentage).toBe(0);
      expect(statsResponse.body.bestScore).toBe(0);
      expect(statsResponse.body.bestPercentage).toBe(0);
    });

    test('User views profile and quiz history together', async () => {
      const { token, user } = await createTestUser();
      
      // Take a quiz first
      const topic = await setupTopicWithQuestions(3);
      await startAndSubmitQuiz(token, topic._id, 3, [1, 1, 1]);

      // View profile
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(profileResponse.body.email).toBe(user.email);
      expect(profileResponse.body.username).toBe(user.username);
      expect(profileResponse.body).not.toHaveProperty('password');

      // View quiz history via user route
      const historyResponse = await request(app)
        .get('/api/users/quiz-history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(Array.isArray(historyResponse.body)).toBe(true);
      expect(historyResponse.body.length).toBeGreaterThan(0);
      
      // Verify quiz history contains populated topic info
      if (historyResponse.body[0].topic) {
        expect(historyResponse.body[0].topic).toHaveProperty('name');
      }
    });
  });

  describe('User progress across different topics', () => {
    test('User takes quizzes on multiple topics and tracks progress per topic', async () => {
      const { token } = await createTestUser();
      
      const Category = (await import('../../Models/CategoryModel.js')).default;
      const Topic = (await import('../../Models/TopicModel.js')).default;
      const Question = (await import('../../Models/QuestionModel.js')).default;

      // Create two topics
      const category = await Category.create({ name: 'Math Category' });
      const topic1 = await Topic.create({
        name: 'Algebra',
        category: category._id,
        subjects: ['Math']
      });
      const topic2 = await Topic.create({
        name: 'Geometry',
        category: category._id,
        subjects: ['Math']
      });

      // Add questions to both topics
      await Question.create([
        {
          questionText: 'Algebra Q1',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'easy',
          topic: topic1._id
        },
        {
          questionText: 'Algebra Q2',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'easy',
          topic: topic1._id
        },
        {
          questionText: 'Geometry Q1',
          options: ['A', 'B'],
          correctOptionIndex: 1,
          difficulty: 'easy',
          topic: topic2._id
        }
      ]);

      // Take quiz on topic1
      const start1 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic1._id.toString(), questionCount: 2 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start1.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }] });

      // Take quiz on topic2
      const start2 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic2._id.toString(), questionCount: 1 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start2.body.quizAttemptId, answers: [{ selected_option_index: 1 }] });

      // View history - should show both attempts
      const historyResponse = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(historyResponse.body.quizAttempts).toHaveLength(2);
      
      // Verify both topics are present
      const topics = historyResponse.body.quizAttempts.map(attempt => 
        attempt.topic ? attempt.topic.name : null
      );
      expect(topics).toContain('Algebra');
      expect(topics).toContain('Geometry');
    });
  });

  describe('User progress improvement tracking', () => {
    test('User improves score over multiple attempts', async () => {
      const { token } = await createTestUser();
      const topic = await setupTopicWithQuestions(5);

      // First attempt: 2/5 (40%)
      const start1 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start1.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 0 }, { selected_option_index: 0 }, { selected_option_index: 0 }] });

      // Second attempt: 4/5 (80%)
      const start2 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start2.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 0 }] });

      // Third attempt: 5/5 (100%)
      const start3 = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 5 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start3.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }, { selected_option_index: 1 }] });

      // View statistics - should show improvement
      const statsResponse = await request(app)
        .get('/api/quiz/stats')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(statsResponse.body.totalAttempts).toBe(3);
      expect(statsResponse.body.bestScore).toBe(5);
      expect(statsResponse.body.bestPercentage).toBe(100);
      
      // Average should be between best and worst
      expect(statsResponse.body.averageScore).toBeGreaterThan(2);
      expect(statsResponse.body.averageScore).toBeLessThan(5);
    });
  });

  describe('User deletes quiz attempt', () => {
    test('User can delete their own quiz attempt', async () => {
      const { token } = await createTestUser();
      const topic = await setupTopicWithQuestions(2);

      // Start and submit quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 2
        })
        .expect(201);

      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }]
        })
        .expect(200);

      // Delete the quiz attempt
      const deleteResponse = await request(app)
        .delete(`/api/quiz/attempt/${startResponse.body.quizAttemptId}`)
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(deleteResponse.body.message).toContain('deleted');

      // Verify it's deleted from history
      const historyResponse = await request(app)
        .get('/api/quiz/history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(historyResponse.body.quizAttempts).toHaveLength(0);

      // Verify it's removed from database
      const deletedAttempt = await QuizAttempt.findById(startResponse.body.quizAttemptId);
      expect(deletedAttempt).toBeNull();
    });

    test('User cannot delete another user quiz attempt', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const topic = await setupTopicWithQuestions(2);

      // User1 creates quiz
      const startResponse = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(user1.token))
        .send({
          topicId: topic._id.toString(),
          questionCount: 2
        })
        .expect(201);

      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(user1.token))
        .send({
          quizAttemptId: startResponse.body.quizAttemptId,
          answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }]
        })
        .expect(200);

      // User2 tries to delete user1's quiz (should fail)
      const deleteResponse = await request(app)
        .delete(`/api/quiz/attempt/${startResponse.body.quizAttemptId}`)
        .set('Cookie', getAuthCookie(user2.token))
        .expect(403);

      expect(deleteResponse.body.message).toContain('Not authorized');
    });
  });
});

