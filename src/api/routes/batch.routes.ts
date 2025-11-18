import { Router } from 'express';
import { Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.ts';
import { logger } from '../../utils/logger.ts';

const router = Router();

// Import batch service (CommonJS module)
// Note: This is a CommonJS module, so we need to use require
const batchAttestationService = require('../../services/batch-attestation.service.js');

/**
 * GET /batch/status - Get batch processing status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = batchAttestationService.getBatchStatus();
    return res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    logger.error('Get batch status error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to get batch status',
      },
    });
  }
});

/**
 * POST /batch/force - Force batch attestation (admin/testing)
 */
router.post('/force', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await batchAttestationService.forceBatchAttestation();
    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Force batch error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to force batch attestation',
      },
    });
  }
});

export default router;

