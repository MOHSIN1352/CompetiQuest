import express from "express";
const router = express.Router();

import {
  getAllQuestions,
  getQuestionById,
  getQuestionsByTopicId,
} from "../Controllers/QuestionControllers.js";

router.get("/", getAllQuestions);
router.get("/:topicId", getQuestionsByTopicId);
router.get("/:id", getQuestionById);

export default router;
