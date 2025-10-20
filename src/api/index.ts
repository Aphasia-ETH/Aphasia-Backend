import { Router } from 'express';
import routes from './routes/index.ts';

const router = Router();

// Mount all routes under /api/v1
router.use('/v1', routes);

export default router;
