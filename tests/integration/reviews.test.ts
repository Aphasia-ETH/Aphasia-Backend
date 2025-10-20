import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

// Mock the blockchain services
vi.mock('../../src/services/blockchain/hedera.service.ts', () => ({
  default: {
    attestReview: vi.fn().mockResolvedValue('0x1234567890abcdef'),
    getProductReviews: vi.fn().mockResolvedValue(['review-1', 'review-2']),
    getReviewAttestation: vi.fn().mockResolvedValue({
      reviewId: 'review-1',
      productId: 'product-1',
      ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      rating: 5,
      reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8',
      timestamp: 1234567890,
      hcsSequence: 42,
      verified: true,
    }),
  },
}));

vi.mock('../../src/services/blockchain/hcs.service.ts', () => ({
  default: {
    submitMessage: vi.fn().mockResolvedValue({
      sequence: '42',
      timestamp: new Date(),
      transactionId: '0.0.123456@1234567890.123456789',
    }),
  },
}));

describe('Reviews API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /reviews/l3', () => {
    it('should create L3 review with on-chain attestation', async () => {
      const reviewData = {
        reviewId: 'review-123',
        productId: 'product-1',
        rating: 5,
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8',
      };

      const res = await request(app)
        .post('/reviews/l3')
        .send(reviewData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.transactionHash).toBe('0x1234567890abcdef');
      expect(res.body.hcsSequence).toBe('42');
    });

    it('should return 400 for missing ipfsHash', async () => {
      const reviewData = {
        reviewId: 'review-123',
        productId: 'product-1',
        rating: 5,
        reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8',
      };

      const res = await request(app)
        .post('/reviews/l3')
        .send(reviewData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('ipfsHash missing');
    });
  });

  describe('GET /reviews/onchain/:productId', () => {
    it('should return on-chain review IDs for product', async () => {
      const res = await request(app)
        .get('/reviews/onchain/product-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reviewIds).toEqual(['review-1', 'review-2']);
    });
  });

  describe('GET /reviews/attestation/:reviewId', () => {
    it('should return on-chain attestation', async () => {
      const res = await request(app)
        .get('/reviews/attestation/review-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.attestation.reviewId).toBe('review-1');
      expect(res.body.attestation.rating).toBe(5);
      expect(res.body.attestation.verified).toBe(true);
    });
  });

  describe('GET /reviews/summary/:productId', () => {
    it('should return product review summary', async () => {
      const res = await request(app)
        .get('/reviews/summary/product-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.productId).toBe('product-1');
      expect(res.body.weights).toEqual({
        l1: 0.5,
        l2: 1.0,
        l3: 2.0,
      });
    });
  });

  describe('POST /reviews/l1', () => {
    it('should create L1 review (stub)', async () => {
      const reviewData = {
        reviewId: 'review-l1-123',
        productId: 'product-1',
        rating: 4,
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8',
      };

      const res = await request(app)
        .post('/reviews/l1')
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.level).toBe(1);
    });
  });

  describe('POST /reviews/l2', () => {
    it('should create L2 review (stub)', async () => {
      const reviewData = {
        reviewId: 'review-l2-123',
        productId: 'product-1',
        rating: 4,
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8',
      };

      const res = await request(app)
        .post('/reviews/l2')
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.level).toBe(2);
    });
  });
});
