import { Router } from 'express';
import { Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.ts';
import { ValidationError } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import IPFSService from '../../services/storage/ipfs.service.ts';

const router = Router();

/**
 * POST /ipfs/upload - Upload content to IPFS
 */
router.post('/upload', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw new ValidationError('Missing content field');
    }

    // Upload to IPFS
    const ipfsHash = await IPFSService.uploadReviewContent(content);

    // Return response matching frontend expectations
    return res.status(201).json({
      success: true,
      data: {
        ipfsHash,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      },
    });
  } catch (error: any) {
    logger.error('IPFS upload error:', error);

    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to upload to IPFS',
      },
    });
  }
});

export default router;

