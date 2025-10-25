// routes/QuizRoutes.js
import express from 'express';
const router = express.Router();

import {
    startQuiz,
    submitQuiz,
    getQuizAttempt,
    getUserQuizHistory,
    getAllQuizAttempts,
    getUserQuizStats,
    getLeaderboard,
    deleteQuizAttempt
} from '../Controllers/QuizControllers.js';

import { protect, admin } from '../Middleware/AuthMiddleware.js';

// User routes
router.post('/start', protect, startQuiz);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getUserQuizHistory);
router.get('/stats', protect, getUserQuizStats);
router.get('/attempt/:id', protect, getQuizAttempt);
router.delete('/attempt/:id', protect, deleteQuizAttempt);

// Public route
router.get('/leaderboard', getLeaderboard);

// Admin route
router.get('/all', protect, admin, getAllQuizAttempts);

export default router;
