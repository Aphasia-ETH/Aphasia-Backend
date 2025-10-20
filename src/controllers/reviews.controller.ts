import { Request, Response } from 'express';
import HederaEvmService from '../services/blockchain/hedera.service.ts';
import HCSService from '../services/blockchain/hcs.service.ts';

export const createLevel1Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, ipfsHash, reviewerWallet } = req.body as any;
    // TODO: persist to DB with verificationLevel=1
    return res.status(201).json({ success: true, level: 1, reviewId, productId, rating, ipfsHash, reviewerWallet });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Failed to create L1 review' });
  }
};

export const createLevel2Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, ipfsHash, reviewerWallet } = req.body as any;
    // TODO: persist to DB with verificationLevel=2
    return res.status(201).json({ success: true, level: 2, reviewId, productId, rating, ipfsHash, reviewerWallet });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Failed to create L2 review' });
  }
};

export const createLevel3Review = async (req: Request, res: Response) => {
  try {
    const { reviewId, productId, rating, content, reviewerWallet } = req.body as {
      reviewId: string;
      productId: string;
      rating: number;
      content: any;
      reviewerWallet: `0x${string}`;
    };

    // 1) Publish HCS message and get sequence
    const topicId = process.env.HCS_TOPIC_ID as string;
    if (!topicId) throw new Error('HCS_TOPIC_ID missing');
    const hcs = await HCSService.submitMessage(topicId, { reviewId, productId, rating });

    // 2) Assume IPFS upload was already performed upstream
    const ipfsHash = (req.body as any).ipfsHash as string;
    if (!ipfsHash) throw new Error('ipfsHash missing');

    // 3) On-chain attestation
    const tx = await HederaEvmService.attestReview({
      reviewId,
      productId,
      ipfsHash,
      rating,
      reviewerWallet,
      hcsSequence: BigInt(hcs.sequence),
    });

    return res.json({ success: true, transactionHash: tx, hcsSequence: hcs.sequence });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Failed to create L3 review' });
  }
};

export const getProductOnchainReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params as { productId: string };
    const reviewIds = await HederaEvmService.getProductReviews(productId);
    return res.json({ success: true, reviewIds });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Failed to fetch on-chain reviews' });
  }
};

export const getReviewAttestation = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params as { reviewId: string };
    const att = await HederaEvmService.getReviewAttestation(reviewId);
    return res.json({ success: true, attestation: att });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: error?.message || 'Attestation not found' });
  }
};

export const getProductReviewsSummary = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params as { productId: string };
    // TODO: compute from DB; stub for now
    const weights = {
      l1: Number(process.env.WEIGHT_L1 || 0.5),
      l2: Number(process.env.WEIGHT_L2 || 1.0),
      l3: Number(process.env.WEIGHT_L3 || 2.0),
    };
    return res.json({ success: true, productId, counts: { l1: 0, l2: 0, l3: 0 }, avgs: { l1: 0, l2: 0, l3: 0 }, weightedAverage: 0, weights });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Failed to compute summary' });
  }
};

