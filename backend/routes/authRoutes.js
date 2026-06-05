import express from 'express';
import { signup, login, googleAuth, githubAuth } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

router.post('/google', googleAuth);
router.post('/github', githubAuth);

export default router;