import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.ts';
import { authLimiter } from '../../middleware/rateLimit.middleware.ts';
import {
  login,
  register,
  getCurrentUser,
  refreshToken,
  logout,
} from '../../controllers/auth.controller.ts';

const router = Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

// POST /auth/register - Register new user
router.post('/register', register);

// POST /auth/login - Login user
router.post('/login', login);

// GET /auth/me - Get current user
router.get('/me', requireAuth, getCurrentUser);

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', requireAuth, refreshToken);

// POST /auth/logout - Logout user
router.post('/logout', requireAuth, logout);

export default router;
