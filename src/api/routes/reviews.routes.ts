import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.ts';
import { reviewLimiter } from '../../middleware/rateLimit.middleware.ts';
import { 
  createLevel1Review, 
  createLevel2Review, 
  createLevel3Review, 
  getReviewContent,
  getProductReviews,
  getProductReviewsSummary
} from '../../controllers/reviews.controller.ts';

const router = Router();

// Create reviews
router.post('/l1', requireAuth, reviewLimiter, createLevel1Review);
router.post('/l2', requireAuth, reviewLimiter, createLevel2Review);
router.post('/l3', requireAuth, reviewLimiter, createLevel3Review);

// Get reviews
router.get('/product/:productId', optionalAuth, getProductReviews);
router.get('/product/:productId/summary', optionalAuth, getProductReviewsSummary);
router.get('/content/:reviewId', optionalAuth, getReviewContent);

export default router;