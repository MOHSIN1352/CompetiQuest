// routes/TopicRoutes.js
import express from 'express';
const router = express.Router();

import {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
    addSubjectToTopic,
    removeSubjectFromTopic,
    getAllSubjects,
    searchTopics
} from '../Controllers/TopicControllers.js';

import { protect, admin } from '../Middleware/AuthMiddleware.js';

// Public routes
router.get('/', getAllTopics);
router.get('/search', searchTopics);
router.get('/subjects', getAllSubjects);
router.get('/:id', getTopicById);

// Admin routes
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);
router.post('/:id/subjects', protect, admin, addSubjectToTopic);
router.delete('/:id/subjects', protect, admin, removeSubjectFromTopic);

export default router;
