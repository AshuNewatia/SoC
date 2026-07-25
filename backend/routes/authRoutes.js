import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile } from '../controllers/authController.js';
import { signup, login, googleAuth, githubAuth, completeOAuthProfile } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';
import { sendOTP, verifyOTPAndSignup } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleAuth);

// POST /api/auth/github
router.post('/github', githubAuth);

router.post('/complete-oauth', completeOAuthProfile);
router.patch('/update-profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/send-otp", sendOTP);
router.post("/verify-otp-signup", verifyOTPAndSignup);

export default router;