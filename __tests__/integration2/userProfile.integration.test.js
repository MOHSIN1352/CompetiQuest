import { describe, test, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../setup/testApp.js';
import { setupTestDB, closeTestDB, clearTestDB } from '../setup/testDatabase.js';
import { createTestUser, getAuthCookie } from '../helpers/testHelpers.js';
import User from '../../Models/UserModel.js';

const app = createTestApp();

describe('User Profile Management Integration Tests', () => {
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

  describe('GET /api/users/profile', () => {
    test('should get user profile successfully', async () => {
      const { token, user } = await createTestUser({
        username: 'profileuser',
        email: 'profile@example.com'
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', 'profileuser');
      expect(response.body).toHaveProperty('email', 'profile@example.com');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body._id.toString()).toBe(user._id.toString());
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });

    test('should return 404 if user not found (token valid but user deleted)', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const user = await User.create({
        username: 'todelete',
        email: 'delete@example.com',
        password: 'password123'
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Delete user
      await User.findByIdAndDelete(user._id);

      // Try to access profile with deleted user token
      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .expect(401); // Should fail because user doesn't exist
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update user profile information successfully', async () => {
      const { token, user } = await createTestUser({
        username: 'originaluser',
        email: 'original@example.com'
      });

      // Update profile
      const updateResponse = await request(app)
        .put('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .send({
          username: 'updateduser',
          email: 'updated@example.com'
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('_id');
      expect(updateResponse.body.username).toBe('updateduser');
      expect(updateResponse.body.email).toBe('updated@example.com');

      // Verify update in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.email).toBe('updated@example.com');
    });

    test('should update only username when email is not provided', async () => {
      const { token, user } = await createTestUser({
        username: 'olduser',
        email: 'keep@example.com'
      });

      const updateResponse = await request(app)
        .put('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .send({
          username: 'newuser'
        })
        .expect(200);

      expect(updateResponse.body.username).toBe('newuser');
      expect(updateResponse.body.email).toBe('keep@example.com');

      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('newuser');
      expect(updatedUser.email).toBe('keep@example.com');
    });

    test('should update only email when username is not provided', async () => {
      const { token, user } = await createTestUser({
        username: 'keepuser',
        email: 'old@example.com'
      });

      const updateResponse = await request(app)
        .put('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .send({
          email: 'new@example.com'
        })
        .expect(200);

      expect(updateResponse.body.username).toBe('keepuser');
      expect(updateResponse.body.email).toBe('new@example.com');

      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('keepuser');
      expect(updatedUser.email).toBe('new@example.com');
    });

    test('should return 400 if email already exists', async () => {
      // Create first user
      await User.create({
        username: 'user1',
        email: 'existing@example.com',
        password: 'password123'
      });

      // Create second user
      const { token } = await createTestUser({
        username: 'user2',
        email: 'user2@example.com'
      });

      // Try to update with existing email
      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', getAuthCookie(token))
        .send({
          email: 'existing@example.com'
        })
        .expect(400);

      expect(response.body.message).toContain('Email already exists');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          username: 'unauthorized'
        })
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });
  });

  describe('PUT /api/users/change-password', () => {
    test('should change password successfully', async () => {
      const { token, user } = await createTestUser({
        password: 'oldpassword123'
      });

      // Change password
      const changePasswordResponse = await request(app)
        .put('/api/users/change-password')
        .set('Cookie', getAuthCookie(token))
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        })
        .expect(200);

      expect(changePasswordResponse.body.message).toContain('updated');

      // Verify: Try to login with old password (should fail)
      await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'oldpassword123'
        })
        .expect(401);

      // Verify: Try to login with new password (should succeed)
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'newpassword456'
        })
        .expect(200);

      expect(loginResponse.body.email).toBe(user.email);
    });

    test('should return 400 if current password is incorrect', async () => {
      const { token } = await createTestUser({
        password: 'correctpassword'
      });

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Cookie', getAuthCookie(token))
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword'
        })
        .expect(400);

      expect(response.body.message).toContain('incorrect');
    });

    test('should return 404 if user not found', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const user = await User.create({
        username: 'todelete',
        email: 'delete@example.com',
        password: 'password123'
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Delete user
      await User.findByIdAndDelete(user._id);

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Cookie', getAuthCookie(token))
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword'
        })
        .expect(401); // Should fail because user doesn't exist
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .send({
          currentPassword: 'old',
          newPassword: 'new'
        })
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });
  });

  describe('GET /api/users/quiz-history', () => {
    test('should get user quiz history via user route', async () => {
      const { token, user } = await createTestUser();
      const { setupTopicWithQuestions } = await import('../helpers/testHelpers.js');
      const topic = await setupTopicWithQuestions(2);

      // Take a quiz
      const start = await request(app)
        .post('/api/quiz/start')
        .set('Cookie', getAuthCookie(token))
        .send({ topicId: topic._id.toString(), questionCount: 2 });
      await request(app)
        .post('/api/quiz/submit')
        .set('Cookie', getAuthCookie(token))
        .send({ quizAttemptId: start.body.quizAttemptId, answers: [{ selected_option_index: 1 }, { selected_option_index: 1 }] });

      // Get quiz history via user route
      const response = await request(app)
        .get('/api/users/quiz-history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('score');
      
      // Verify topic is populated if present
      if (response.body[0].topic) {
        expect(response.body[0].topic).toHaveProperty('name');
      }
    });

    test('should return empty array if no quiz history', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/users/quiz-history')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('DELETE /api/users/delete', () => {
    test('should delete user account successfully', async () => {
      const { token, user } = await createTestUser();

      const deleteResponse = await request(app)
        .delete('/api/users/delete')
        .set('Cookie', getAuthCookie(token))
        .expect(200);

      expect(deleteResponse.body.message).toContain('deleted');

      // Verify user is deleted from database
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();

      // Verify cannot login with deleted account
      await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'password123'
        })
        .expect(401);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/users/delete')
        .expect(401);

      expect(response.body.message).toContain('authorized');
    });
  });

  describe('Complete Profile Management Flow', () => {
    test('User completes full profile management workflow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'workflowuser',
          email: 'workflow@example.com',
          password: 'password123'
        })
        .expect(201);

      const cookie = registerResponse.headers['set-cookie'][0];
      const token = cookie.split('=')[1].split(';')[0];

      // Step 2: Get profile
      const profileResponse1 = await request(app)
        .get('/api/users/profile')
        .set('Cookie', `jwt=${token}`)
        .expect(200);

      expect(profileResponse1.body.username).toBe('workflowuser');

      // Step 3: Update profile
      const updateResponse = await request(app)
        .put('/api/users/profile')
        .set('Cookie', `jwt=${token}`)
        .send({
          username: 'updatedworkflow',
          email: 'updatedworkflow@example.com'
        })
        .expect(200);

      expect(updateResponse.body.username).toBe('updatedworkflow');

      // Step 4: Verify profile updated
      const profileResponse2 = await request(app)
        .get('/api/users/profile')
        .set('Cookie', `jwt=${token}`)
        .expect(200);

      expect(profileResponse2.body.username).toBe('updatedworkflow');
      expect(profileResponse2.body.email).toBe('updatedworkflow@example.com');

      // Step 5: Change password
      await request(app)
        .put('/api/users/change-password')
        .set('Cookie', `jwt=${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        })
        .expect(200);

      // Step 6: Logout
      await request(app)
        .post('/api/auth/logout')
        .expect(200);

      // Step 7: Login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'updatedworkflow',
          password: 'newpassword456'
        })
        .expect(200);

      expect(loginResponse.body.username).toBe('updatedworkflow');
    });
  });
});

