// routes/AuthRoutes.js
import express from 'express';
const router = express.Router();

import { registerUser, loginUser } from '../Controllers/UserControllers.js';

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
