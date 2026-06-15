import express from 'express';
// Make sure to import the new completeOAuthProfile function
import { signup, login, googleAuth, githubAuth, completeOAuthProfile } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleAuth);

// POST /api/auth/github
router.post('/github', githubAuth);

// POST /api/auth/complete-oauth -> This is the new bridge for the profile creation!
router.post('/complete-oauth', completeOAuthProfile);

export default router;