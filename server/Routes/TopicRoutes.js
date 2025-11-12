import express from "express";
const router = express.Router();

import {
  getAllTopics,
  getTopicById,
  getTopicsByCategoryId,
} from "../Controllers/TopicControllers.js";

router.get("/", getAllTopics);
router.get("/:categoryId", getTopicsByCategoryId);
router.get("/:id", getTopicById);

export default router;
