import { Request, Response } from 'express';
import { logger } from '../utils/logger.ts';
import HederaEvmService from '../services/blockchain/hedera.service.ts';
import HCSService from '../services/blockchain/hcs.service.ts';
import IPFSService, { ReviewContent } from '../services/storage/ipfs.service.ts';

export const createLevel1Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createLevel2Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createLevel3Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, text, authorId, reviewerWallet } = req.body;

    if (!reviewId || !productId || !rating || !text || !authorId || !reviewerWallet) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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
    if (!topicId) throw new Error('HCS_TOPIC_ID not configured');
    
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

    return res.status(200).json({
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
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get review content from IPFS by review ID
export const getReviewContent = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const attestation = await HederaEvmService.getReviewAttestation(reviewId);
    const content = await IPFSService.getReviewContent(attestation.ipfsHash);
    
    return res.json({ success: true, data: { reviewId, content } });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: 'Review not found' });
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
    
    return res.json({ success: true, data: { productId, reviews } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
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

