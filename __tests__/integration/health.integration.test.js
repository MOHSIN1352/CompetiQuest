import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { setupTestDB, closeTestDB } from './testSetup.js';

describe('Health Check Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/health', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.message).toBe('Server is running');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      const timestamp = response.body.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Server Status Validation', () => {
    test('should confirm server is operational', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('running');
    });

    test('should handle multiple health check requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });
});