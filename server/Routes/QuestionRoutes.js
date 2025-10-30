// routes/QuestionRoutes.js
import express from "express";
const router = express.Router();

import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByDifficulty,
  getQuestionsBySubject,
  getRandomQuestions,
  searchQuestions,
  getQuestionsByTopicId
} from "../Controllers/QuestionControllers.js";

import { protect, admin } from "../Middleware/AuthMiddleware.js";

// Public routes
router.get("/", getAllQuestions);
router.get("/search", searchQuestions);
router.get("/random", getRandomQuestions);
router.get("/difficulty/:difficulty", getQuestionsByDifficulty);
router.get("/subject/:subject", getQuestionsBySubject);
router.get("/:topicId", getQuestionsByTopicId);
router.get("/:id", getQuestionById);

// Admin routes
router.post("/", protect, admin, createQuestion);
router.put("/:id", protect, admin, updateQuestion);
router.delete("/:id", protect, admin, deleteQuestion);

export default router;
