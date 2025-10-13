import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.ts';
import { authLimiter } from '../../middleware/rateLimit.middleware.ts';

const router = Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

// POST /auth/login - Login user
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Not implemented yet',
  });
});

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Not implemented yet',
  });
});

// POST /auth/logout - Logout user
router.post('/logout', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Not implemented yet',
  });
});

// GET /auth/me - Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export default router;
