import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import usersRoutes from './users.routes.ts';
import reviewsRoutes from './reviews.routes.ts';
import verificationRoutes from './verification.routes.ts';
import batchRoutes from './batch.routes.ts';
import ipfsRoutes from './ipfs.routes.ts';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', usersRoutes); // Singular /user to match frontend
router.use('/users', usersRoutes); // Plural /users for backward compatibility
router.use('/reviews', reviewsRoutes);
router.use('/verification', verificationRoutes);
router.use('/batch', batchRoutes);
router.use('/ipfs', ipfsRoutes);

export default router;
