// routes/QuizRoutes.js
import express from "express";
const router = express.Router();

import {
  startQuiz,
  submitQuiz,
  getUserQuizHistory,
  getUserQuizStats,
  generateQuiz,
} from "../Controllers/QuizControllers.js";

import { protect, admin } from "../Middleware/AuthMiddleware.js";

// User routes
router.post("/generate", generateQuiz);
router.post("/submit", submitQuiz);
router.get("/history/:userId", getUserQuizHistory);
router.post("/start", protect, startQuiz);
router.get("/stats/:userId", getUserQuizStats);

export default router;
