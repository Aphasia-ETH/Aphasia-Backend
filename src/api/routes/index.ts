import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import reviewsRoutes from './reviews.routes';
import verificationRoutes from './verification.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/verification', verificationRoutes);

export default router;
