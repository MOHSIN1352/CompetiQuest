import express from 'express';
import {
    getAllCategories,
    createCategory,
    deleteCategory,
    getAllTopics,
    createTopic,
    deleteTopic,
    getAllQuestions,
    createQuestion,
    deleteQuestion,
    getDashboardStats
} from '../Controllers/AdminControllers.js';

const router = express.Router();

// Test routes without any authentication
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/topics', getAllTopics);
router.post('/topics', createTopic);
router.delete('/topics/:id', deleteTopic);

router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.delete('/questions/:id', deleteQuestion);

router.get('/dashboard-stats', getDashboardStats);

export default router;