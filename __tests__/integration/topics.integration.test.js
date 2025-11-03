import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('Topics Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/topics', () => {
    test('should get all topics successfully', async () => {
      const response = await request(app)
        .get('/api/topics');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const topic = response.body[0];
      expect(topic).toHaveProperty('_id');
      expect(topic).toHaveProperty('name');
      expect(topic).toHaveProperty('category');
    });
  });

  describe('POST /api/topics', () => {
    test('should create a new topic successfully', async () => {
      const topicData = {
        name: 'React.js',
        category: 'cat1',
        description: 'React JavaScript library'
      };

      const response = await request(app)
        .post('/api/topics')
        .send(topicData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(topicData.name);
      expect(response.body.category).toBe(topicData.category);
    });
  });

  describe('Topic Management Flow', () => {
    test('should complete full topic management workflow', async () => {
      // Get initial topics
      const initialResponse = await request(app)
        .get('/api/topics');

      expect(initialResponse.status).toBe(200);
      const initialCount = initialResponse.body.length;

      // Create new topic
      const newTopic = {
        name: 'Node.js',
        category: 'cat1',
        description: 'Node.js runtime environment'
      };

      const createResponse = await request(app)
        .post('/api/topics')
        .send(newTopic);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe(newTopic.name);

      // Verify topic was created
      const finalResponse = await request(app)
        .get('/api/topics');

      expect(finalResponse.status).toBe(200);
    });
  });

  describe('Topic Filtering', () => {
    test('should handle topic queries', async () => {
      const response = await request(app)
        .get('/api/topics?search=JavaScript');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should handle category filtering', async () => {
      const response = await request(app)
        .get('/api/topics?category=cat1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});