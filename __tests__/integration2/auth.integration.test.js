import { describe, test, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../setup/testApp.js';
import { setupTestDB, closeTestDB, clearTestDB } from '../setup/testDatabase.js';
import User from '../../Models/UserModel.js';

const app = createTestApp();

describe('User Authentication Flow Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
    process.env.JWT_SECRET = 'test-secret-key-for-integration-tests';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', 'newuser');
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).not.toHaveProperty('password');
      expect(response.headers['set-cookie']).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: 'newuser@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('newuser');
      expect(user.role).toBe('user');
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should return 409 for duplicate email', async () => {
      // Create first user
      await User.create({
        username: 'firstuser',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'seconduser',
          email: 'duplicate@example.com',
          password: 'password123'
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    test('should set admin role for admin email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin',
          email: 'admin@competiquest.com',
          password: 'admin123'
        })
        .expect(201);

      expect(response.body.role).toBe('admin');

      // Verify in database
      const user = await User.findOne({ email: 'admin@competiquest.com' });
      expect(user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      // Create a user first
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', 'loginuser');
      expect(response.body).toHaveProperty('email', 'login@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should return 401 for invalid credentials', async () => {
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    test('should return 401 if user not found', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('GET /api/auth/validate', () => {
    test('should validate token and return user', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const user = await User.create({
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123'
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      const response = await request(app)
        .get('/api/auth/validate')
        .set('Cookie', `jwt=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user._id.toString()).toBe(user._id.toString());
      expect(response.body.user.email).toBe('valid@example.com');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Cookie', 'jwt=invalid-token')
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toContain('Logged out');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Complete Registration and Login Flow', () => {
    test('should complete full user registration and login flow', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(registerResponse.body.email).toBe('john@example.com');
      expect(registerResponse.headers['set-cookie']).toBeDefined();

      // Step 2: Logout
      await request(app)
        .post('/api/auth/logout')
        .expect(200);

      // Step 3: Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body.email).toBe('john@example.com');
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      // Step 4: Extract token and validate
      const cookie = loginResponse.headers['set-cookie'][0];
      const token = cookie.split('=')[1].split(';')[0];
      
      const validateResponse = await request(app)
        .get('/api/auth/validate')
        .set('Cookie', `jwt=${token}`)
        .expect(200);

      expect(validateResponse.body.user.email).toBe('john@example.com');
      expect(validateResponse.body.user.username).toBe('johndoe');
    });
  });
});

