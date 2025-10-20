import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import usersRoutes from './users.routes.ts';
import reviewsRoutes from './reviews.routes.ts';
import verificationRoutes from './verification.routes.ts';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/verification', verificationRoutes);

export default router;
