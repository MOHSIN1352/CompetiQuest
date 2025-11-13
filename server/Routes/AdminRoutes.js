import express from 'express';
import { protect, admin } from '../Middleware/AuthMiddleware.js';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllTopics,
    getTopicsByCategory,
    createTopic,
    updateTopic,
    deleteTopic,
    getAllQuestions,
    getQuestionsByTopic,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getDashboardStats
} from '../Controllers/AdminControllers.js';

const router = express.Router();

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

router.use(protect, admin);

router.get('/dashboard-stats', getDashboardStats);

router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/topics', getAllTopics);
router.get('/topics/category/:categoryId', getTopicsByCategory);
router.post('/topics', createTopic);
router.put('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);

router.get('/questions', getAllQuestions);
router.get('/questions/topic/:topicId', getQuestionsByTopic);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
