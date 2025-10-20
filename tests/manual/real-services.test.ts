import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

// This test file uses REAL services - only run manually
// Run with: pnpm test tests/manual/real-services.test.ts

describe('Real Services Integration (Manual)', () => {
  // Skip in CI - only run manually
  it.skip('should create L3 review with real blockchain', async () => {
    const reviewData = {
      reviewId: `review-${Date.now()}`,
      productId: 'amazon.com/dp/B08ABC123',
      rating: 5,
      ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', // Real IPFS hash
      reviewerWallet: '0x81082885ec91b1794f22887c3292aa850caa6aa8', // Your test wallet
    };

    // You need a real JWT token for this
    const token = 'your-jwt-token-here';
    
    const res = await request(app)
      .post('/reviews/l3')
      .set('Authorization', `Bearer ${token}`)
      .send(reviewData);

    console.log('L3 Review Response:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactionHash).toMatch(/^0x/);
    expect(res.body.hcsSequence).toBeDefined();
  });

  it.skip('should read on-chain reviews with real contract', async () => {
    const res = await request(app)
      .get('/reviews/onchain/amazon.com/dp/B08ABC123');

    console.log('On-chain Reviews:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.reviewIds)).toBe(true);
  });
});
