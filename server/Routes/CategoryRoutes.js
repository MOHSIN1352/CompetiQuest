// routes/CategoryRoutes.js
import express from "express";
const router = express.Router();

import {
  getAllCategories,
  getCategoryById,
} from "../Controllers/CategoryControllers.js";

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

export default router;
