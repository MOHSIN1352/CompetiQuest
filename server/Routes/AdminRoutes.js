import express from 'express';
import { protect, admin } from '../Middleware/AuthMiddleware.js';
import {
    // Category CRUD
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Topic CRUD
    getAllTopics,
    getTopicsByCategory,
    createTopic,
    updateTopic,
    deleteTopic,
    
    // Question CRUD
    getAllQuestions,
    getQuestionsByTopic,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Dashboard
    getDashboardStats
} from '../Controllers/AdminControllers.js';

const router = express.Router();

// Test routes without auth (for debugging)
router.get('/test/categories', getAllCategories);
router.post('/test/categories', createCategory);
router.delete('/test/categories/:id', deleteCategory);
router.get('/test/topics', getAllTopics);
router.post('/test/topics', createTopic);
router.delete('/test/topics/:id', deleteTopic);
router.get('/test/questions', getAllQuestions);
router.get('/test/questions/topic/:topicId', getQuestionsByTopic);
router.post('/test/questions', createQuestion);
router.put('/test/questions/:id', updateQuestion);
router.delete('/test/questions/:id', deleteQuestion);
router.get('/test/dashboard-stats', getDashboardStats);

// Apply admin middleware to all protected routes
router.use(protect, admin);

// ==================== DASHBOARD ====================
router.get('/dashboard-stats', getDashboardStats);

// ==================== CATEGORY ROUTES ====================
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ==================== TOPIC ROUTES ====================
router.get('/topics', getAllTopics);
router.get('/topics/category/:categoryId', getTopicsByCategory);
router.post('/topics', createTopic);
router.put('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);

// ==================== QUESTION ROUTES ====================
router.get('/questions', getAllQuestions);
router.get('/questions/topic/:topicId', getQuestionsByTopic);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
