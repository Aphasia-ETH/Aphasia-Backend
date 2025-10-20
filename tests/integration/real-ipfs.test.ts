import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Real IPFS Integration Tests', () => {
  // Test with real IPFS service (no mocks)
  describe('POST /reviews/l1', () => {
    it('should create L1 review with real IPFS upload', async () => {
      const reviewData = {
        reviewId: 'test-real-l1-' + Date.now(),
        productId: 'product-1',
        rating: 5,
        text: 'This is a real test review for L1 verification.',
        authorId: 'user-123'
      };

      const token = 'mock-jwt-token'; // You'll need real JWT for this
      const res = await request(app)
        .post('/reviews/l1')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ipfsHash).toBeDefined();
      expect(res.body.data.level).toBe(1);
      
      console.log('L1 Review created with IPFS hash:', res.body.data.ipfsHash);
    });
  });

  describe('POST /reviews/l2', () => {
    it('should create L2 review with real IPFS upload', async () => {
      const reviewData = {
        reviewId: 'test-real-l2-' + Date.now(),
        productId: 'product-1',
        rating: 4,
        text: 'This is a real test review for L2 verification.',
        authorId: 'user-456'
      };

      const token = 'mock-jwt-token';
      const res = await request(app)
        .post('/reviews/l2')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ipfsHash).toBeDefined();
      expect(res.body.data.level).toBe(2);
      
      console.log('L2 Review created with IPFS hash:', res.body.data.ipfsHash);
    });
  });

  describe('POST /reviews/l3', () => {
    it('should create L3 review with real IPFS + HCS + blockchain', async () => {
      const reviewData = {
        reviewId: 'test-real-l3-' + Date.now(),
        productId: 'product-1',
        rating: 5,
        text: 'This is a real test review for L3 verification with full blockchain integration.',
        authorId: 'user-789',
        reviewerWallet: '0x1234567890abcdef1234567890abcdef12345678'
      };

      const token = 'mock-jwt-token';
      const res = await request(app)
        .post('/reviews/l3')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ipfsHash).toBeDefined();
      expect(res.body.data.level).toBe(3);
      expect(res.body.data.transactionHash).toBeDefined();
      expect(res.body.data.hcsSequence).toBeDefined();
      
      console.log('L3 Review created with:');
      console.log('- IPFS hash:', res.body.data.ipfsHash);
      console.log('- Transaction hash:', res.body.data.transactionHash);
      console.log('- HCS sequence:', res.body.data.hcsSequence);
    });
  });

  describe('GET /reviews/content/:reviewId', () => {
    it('should retrieve review content from real IPFS', async () => {
      // First create a review
      const reviewData = {
        reviewId: 'test-retrieve-' + Date.now(),
        productId: 'product-1',
        rating: 5,
        text: 'This review will be retrieved from IPFS.',
        authorId: 'user-retrieve'
      };

      const token = 'mock-jwt-token';
      
      // Create the review
      const createRes = await request(app)
        .post('/reviews/l1')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(createRes.status).toBe(201);
      const reviewId = createRes.body.data.reviewId;

      // Now retrieve it
      const getRes = await request(app)
        .get(`/reviews/content/${reviewId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.content.text).toBe(reviewData.text);
      expect(getRes.body.data.content.rating).toBe(reviewData.rating);
      
      console.log('Retrieved review content:', getRes.body.data.content);
    });
  });
});
