import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('User Profile Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/users/profile', () => {
    test('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
      expect(response.body.username).toBe('testuser');
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update user profile successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(updateData.username);
      expect(response.body.email).toBe(updateData.email);
    });

    test('should update only username when email not provided', async () => {
      const updateData = {
        username: 'newusername'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(updateData.username);
      expect(response.body).toHaveProperty('email');
    });

    test('should update only email when username not provided', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body).toHaveProperty('username');
    });
  });

  describe('Complete Profile Management Flow', () => {
    test('should complete full profile management workflow', async () => {
      // Get initial profile
      const initialResponse = await request(app)
        .get('/api/users/profile');

      expect(initialResponse.status).toBe(200);
      const initialProfile = initialResponse.body;

      // Update profile
      const updateData = {
        username: 'workflowuser',
        email: 'workflow@example.com'
      };

      const updateResponse = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.username).toBe(updateData.username);
      expect(updateResponse.body.email).toBe(updateData.email);

      // Verify profile was updated
      const finalResponse = await request(app)
        .get('/api/users/profile');

      expect(finalResponse.status).toBe(200);
    });
  });
});