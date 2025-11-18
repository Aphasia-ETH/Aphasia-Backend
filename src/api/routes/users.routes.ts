import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.ts';
import { getProfile, updateProfile, getStats } from '../../controllers/users.controller.ts';

const router = Router();

// Routes matching frontend expectations (singular /user)
// GET /user/profile - Get current user profile
router.get('/profile', requireAuth, getProfile);

// PATCH /user/profile - Update current user profile
router.patch('/profile', requireAuth, updateProfile);

// GET /user/stats - Get user statistics
router.get('/stats', requireAuth, getStats);

// Legacy routes (plural /users) - kept for backward compatibility
// GET /users/me - Get current user profile
router.get('/me', requireAuth, getProfile);

// PATCH /users/me - Update current user
router.patch('/me', requireAuth, updateProfile);

// GET /users/:id - Get user by ID (public, no auth required)
router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

export default router;
