// routes/UserRoutes.js
import express from "express";
const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
  getUserQuizHistory,
} from "../Controllers/UserControllers.js";

import { protect, admin } from "../Middleware/AuthMiddleware.js";

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/quiz-history", protect, getUserQuizHistory);

export default router;
