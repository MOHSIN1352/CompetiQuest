// routes/UserRoutes.js
import express from 'express';
const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserQuizHistory,
  deleteUser,
  getAllUsers
} from '../Controllers/UserControllers.js';

import { protect, admin } from '../Middleware/AuthMiddleware.js';

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.get('/quiz-history', protect, getUserQuizHistory);
router.delete('/delete', protect, deleteUser);

// Admin routes
router.get('/all', protect, admin, getAllUsers);

export default router;
