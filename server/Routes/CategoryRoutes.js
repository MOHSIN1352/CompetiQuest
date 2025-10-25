// routes/CategoryRoutes.js
import express from 'express';
const router = express.Router();

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../Controllers/CategoryControllers.js';

import { protect, admin } from '../Middleware/AuthMiddleware.js';

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
