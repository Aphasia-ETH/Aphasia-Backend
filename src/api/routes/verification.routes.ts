import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// POST /verification/level1/initiate
router.post('/level1/initiate', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

// POST /verification/level2/connect/:provider
router.post('/level2/connect/:provider', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

// POST /verification/level3/initiate
router.post('/level3/initiate', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

// GET /verification/status
router.get('/status', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

export default router;
