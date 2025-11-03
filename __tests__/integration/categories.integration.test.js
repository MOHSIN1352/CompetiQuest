import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('Categories Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/categories', () => {
    test('should get all categories successfully', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const category = response.body[0];
      expect(category).toHaveProperty('_id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });
  });

  describe('POST /api/categories', () => {
    test('should create a new category successfully', async () => {
      const categoryData = {
        name: 'Science',
        description: 'Science related topics'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(categoryData.name);
      expect(response.body.description).toBe(categoryData.description);
    });
  });

  describe('Category Management Flow', () => {
    test('should complete full category management workflow', async () => {
      // Get initial categories
      const initialResponse = await request(app)
        .get('/api/categories');

      expect(initialResponse.status).toBe(200);
      const initialCount = initialResponse.body.length;

      // Create new category
      const newCategory = {
        name: 'Technology',
        description: 'Technology and IT topics'
      };

      const createResponse = await request(app)
        .post('/api/categories')
        .send(newCategory);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe(newCategory.name);

      // Verify category was created
      const finalResponse = await request(app)
        .get('/api/categories');

      expect(finalResponse.status).toBe(200);
    });
  });
});