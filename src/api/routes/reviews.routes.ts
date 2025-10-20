import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { reviewLimiter } from '../../middleware/rateLimit.middleware';
import { createLevel1Review, createLevel2Review, createLevel3Review, getProductOnchainReviews, getReviewAttestation } from '../../controllers/reviews.controller.ts';
import { getProductReviewsSummary } from '../../controllers/reviews.controller.ts';

const router = Router();

// GET /reviews - placeholder
router.get('/', optionalAuth, (req, res) => {
  res.json({ success: true, message: 'Not implemented' });
});

// L1/L2/L3 creation
router.post('/l1', requireAuth, reviewLimiter, createLevel1Review);
router.post('/l2', requireAuth, reviewLimiter, createLevel2Review);
router.post('/l3', requireAuth, reviewLimiter, createLevel3Review);

// On-chain reads
router.get('/onchain/:productId', optionalAuth, getProductOnchainReviews);
router.get('/attestation/:reviewId', optionalAuth, getReviewAttestation);

// Product summary
router.get('/summary/:productId', optionalAuth, getProductReviewsSummary);

export default router;
