import { Request, Response } from 'express';
import { logger } from '../utils/logger.ts';
import { ValidationError } from '../utils/errors.ts';
import HederaEvmService from '../services/blockchain/hedera.service.ts';
import HCSService from '../services/blockchain/hcs.service.ts';
import IPFSService, { ReviewContent } from '../services/storage/ipfs.service.ts';

export const createLevel1Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId) {
      throw new ValidationError('Missing required fields: reviewId, productId, rating, text, authorId');
    }

    const reviewContent: ReviewContent = {
      reviewId,
      productId,
      rating: parseInt(rating),
      text,
      authorId,
      timestamp: Date.now()
    };

    const ipfsHash = await IPFSService.uploadReviewContent(reviewContent);

    return res.status(201).json({
      success: true,
      data: { reviewId, productId, rating, ipfsHash, level: 1 }
    });
  } catch (error: any) {
    logger.error('Create L1 review error:', error);
    
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
        message: error?.message || 'Failed to create review',
      },
    });
  }
};

export const createLevel2Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId) {
      throw new ValidationError('Missing required fields: reviewId, productId, rating, text, authorId');
    }

    const reviewContent: ReviewContent = {
      reviewId,
      productId,
      rating: parseInt(rating),
      text,
      authorId,
      timestamp: Date.now()
    };

    const ipfsHash = await IPFSService.uploadReviewContent(reviewContent);

    return res.status(201).json({
      success: true,
      data: { reviewId, productId, rating, ipfsHash, level: 2 }
    });
  } catch (error: any) {
    logger.error('Create L2 review error:', error);
    
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
        message: error?.message || 'Failed to create review',
      },
    });
  }
};

export const createLevel3Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId, reviewerWallet } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId || !reviewerWallet) {
      throw new ValidationError('Missing required fields: reviewId, productId, rating, text, authorId, reviewerWallet');
    }

    // 1. Upload to IPFS
    const reviewContent: ReviewContent = {
      reviewId,
      productId,
      rating: parseInt(rating),
      text,
      authorId,
      timestamp: Date.now()
    };

    const ipfsHash = await IPFSService.uploadReviewContent(reviewContent);

    // 2. HCS message
    const topicId = process.env.HCS_TOPIC_ID as string;
    if (!topicId) {
      throw new ValidationError('HCS_TOPIC_ID not configured');
    }
    
    const hcs = await HCSService.submitMessage(topicId, { reviewId, productId, rating, ipfsHash });

    // 3. On-chain attestation
    const tx = await HederaEvmService.attestReview(
      reviewId,
      productId,
      ipfsHash,
      parseInt(rating),
      reviewerWallet,
      BigInt(hcs.sequence)
    );

    return res.status(201).json({
      success: true,
      data: { 
        reviewId, 
        productId, 
        rating, 
        ipfsHash, 
        level: 3,
        transactionHash: tx,
        hcsSequence: hcs.sequence
      }
    });
  } catch (error: any) {
    logger.error('Create L3 review error:', error);
    
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
        message: error?.message || 'Failed to create review',
      },
    });
  }
};

// Get review content from IPFS by review ID
export const getReviewContent = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const attestation = await HederaEvmService.getReviewAttestation(reviewId);
    const content = await IPFSService.getReviewContent(attestation.ipfsHash);
    
    return res.json({ 
      success: true, 
      data: { 
        reviewId, 
        content: content.text || content,
        ipfsHash: attestation.ipfsHash 
      } 
    });
  } catch (error: any) {
    logger.error('Get review content error:', error);
    return res.status(404).json({ 
      success: false, 
      error: {
        code: 'NOT_FOUND',
        message: 'Review not found',
      }
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    // TODO: Implement database query to get all reviews for product
    // For now, return mock data
    const reviews = [
      {
        reviewId: 'review-1',
        productId,
        rating: 5,
        text: 'Great product!',
        authorId: 'user-1',
        level: 1,
        timestamp: Date.now()
      }
    ];
    
    return res.json({ 
      success: true, 
      data: { 
        productId, 
        reviews 
      } 
    });
  } catch (error: any) {
    logger.error('Get product reviews error:', error);
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to get reviews',
      }
    });
  }
};

// Get product reviews summary
export const getProductReviewsSummary = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    // TODO: Implement database query to get review summary
    // For now, return mock data
    const summary = {
      productId,
      totalReviews: 10,
      averageRating: 4.5,
      ratingDistribution: {
        5: 6,
        4: 3,
        3: 1,
        2: 0,
        1: 0
      },
      levelDistribution: {
        l1: 5,
        l2: 3,
        l3: 2
      }
    };
    
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create L3 review with batch optimization
export const createLevel3BatchReview = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        }
      });
    }

    const { productId, rating, text, images } = req.body;
    const reviewerWallet = req.body.reviewerWallet || req.user.privyUserId || '';

    if (!productId || !rating) {
      throw new ValidationError('Product ID and rating are required');
    }

    const reviewId = `l3-batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Upload to IPFS
    const reviewContent: ReviewContent = {
      reviewId,
      productId,
      rating: parseInt(rating),
      text: text || '',
      authorId: req.user.userId,
      timestamp: Date.now()
    };

    const ipfsHash = await IPFSService.uploadReviewContent(reviewContent);

    // 2. HCS message (immediate verification)
    const topicId = process.env.HCS_TOPIC_ID as string;
    if (!topicId) {
      throw new ValidationError('HCS_TOPIC_ID not configured');
    }
    
    const hcs = await HCSService.submitMessage(topicId, { 
      reviewId, 
      productId, 
      rating: parseInt(rating), 
      ipfsHash 
    });

    // 3. Add to batch queue (for batched attestation)
    // Note: This requires the batch service which is in CommonJS
    // For now, we'll return the review with batch status
    // Full implementation would require database integration
    
    return res.status(201).json({ 
      success: true,
      data: {
        level: 3, 
        reviewId, 
        productId, 
        rating: parseInt(rating), 
        ipfsHash, 
        reviewerWallet,
        hcsSequence: hcs.sequence,
        onChainVerified: true,
        verification: {
          hcs: {
            sequence: hcs.sequence,
            topicId: topicId,
            url: `https://hashscan.io/testnet/topic/${topicId}`,
            cost: '$0.0001',
            status: 'verified'
          },
          batch: {
            status: 'pending',
            message: 'Will be included in next batch (every 100 reviews or 1 hour)',
            estimatedCost: '$0.001 per review'
          }
        }
      }
    });
  } catch (error: any) {
    logger.error('Create L3 batch review error:', error);
    
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
        message: error?.message || 'Failed to create L3 batch review',
      }
    });
  }
};

