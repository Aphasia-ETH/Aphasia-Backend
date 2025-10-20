const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import services
const ipfsService = require('./services/ipfs');
const databaseService = require('./services/database');
const hederaService = require('./services/hedera');
const contractService = require('./services/contract');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// IPFS upload endpoint
app.post('/api/v1/ipfs/upload', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing content field' 
      });
    }

    const ipfsHash = await ipfsService.uploadReviewContent(content);
    
    res.status(201).json({ 
      success: true, 
      ipfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to upload to IPFS' 
    });
  }
});

// L1 review route - Simple (IPFS handled upstream)
app.post('/api/v1/reviews/l1', async (req, res) => {
  try {
    const { reviewId, productId, rating, ipfsHash, reviewerWallet, text, authorId } = req.body;
    
    if (!reviewId || !productId || !rating || !ipfsHash || !authorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: reviewId, productId, rating, ipfsHash, authorId' 
      });
    }

    // Create or get user
    const user = await databaseService.createOrGetUser({
      privyUserId: authorId,
      privyWallet: reviewerWallet || '',
      verificationLevel: 1,
      trustScore: 0
    });

    // Persist to DB with verificationLevel=1
    const review = await databaseService.createReview({
      productId,
      productUrl: '',
      platform: 'aphasia',
      rating: parseInt(rating),
      text: text || '',
      authorId: user.id,
      authorVerificationLevel: 1,
      authorTrustScore: 0,
      ipfsHash,
      hederaSequence: '',
      hederaTopicId: '',
      hederaTimestamp: new Date(),
      onChainVerified: false
    });

    res.status(201).json({ 
      success: true, 
      level: 1, 
      reviewId: review.id, 
      productId, 
      rating, 
      ipfsHash, 
      reviewerWallet 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error?.message || 'Failed to create L1 review' 
    });
  }
});

// L2 review route - Simple (IPFS handled upstream)
app.post('/api/v1/reviews/l2', async (req, res) => {
  try {
    const { reviewId, productId, rating, ipfsHash, reviewerWallet, text, authorId } = req.body;
    
    if (!reviewId || !productId || !rating || !ipfsHash || !authorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: reviewId, productId, rating, ipfsHash, authorId' 
      });
    }

    // Create or get user
    const user = await databaseService.createOrGetUser({
      privyUserId: authorId,
      privyWallet: reviewerWallet || '',
      verificationLevel: 2,
      trustScore: 50
    });

    // Persist to DB with verificationLevel=2
    const review = await databaseService.createReview({
      productId,
      productUrl: '',
      platform: 'aphasia',
      rating: parseInt(rating),
      text: text || '',
      authorId: user.id,
      authorVerificationLevel: 2,
      authorTrustScore: 50,
      ipfsHash,
      hederaSequence: '',
      hederaTopicId: '',
      hederaTimestamp: new Date(),
      onChainVerified: false
    });

    res.status(201).json({ 
      success: true, 
      level: 2, 
      reviewId: review.id, 
      productId, 
      rating, 
      ipfsHash, 
      reviewerWallet 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error?.message || 'Failed to create L2 review' 
    });
  }
});

// L3 review route - Hedera integration (IPFS handled upstream)
app.post('/api/v1/reviews/l3', async (req, res) => {
  try {
    const { reviewId, productId, rating, ipfsHash, reviewerWallet, text, authorId } = req.body;
    
    if (!reviewId || !productId || !rating || !ipfsHash || !reviewerWallet || !authorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: reviewId, productId, rating, ipfsHash, reviewerWallet, authorId' 
      });
    }

    // Create or get user
    const user = await databaseService.createOrGetUser({
      privyUserId: authorId,
      privyWallet: reviewerWallet,
      verificationLevel: 3,
      trustScore: 100
    });

    // 1. Submit HCS message
    const hcsResult = await hederaService.submitHCSMessage({
      reviewId,
      productId,
      rating: parseInt(rating),
      ipfsHash,
      reviewerWallet,
      timestamp: Date.now()
    });

    // 2. On-chain attestation
    const contractTxHash = await contractService.attestReview(
      reviewId,
      productId,
      ipfsHash,
      parseInt(rating),
      reviewerWallet,
      BigInt(hcsResult.sequence)
    );

    // 3. Persist to DB with blockchain data
    const review = await databaseService.createReview({
      productId,
      productUrl: '',
      platform: 'aphasia',
      rating: parseInt(rating),
      text: text || '',
      authorId: user.id,
      authorVerificationLevel: 3,
      authorTrustScore: 100,
      ipfsHash,
      hederaSequence: hcsResult.sequence,
      hederaTopicId: process.env.HCS_TOPIC_ID || '',
      hederaTimestamp: new Date(),
      onChainVerified: true
    });

    res.status(201).json({ 
      success: true, 
      level: 3, 
      reviewId: review.id, 
      productId, 
      rating, 
      ipfsHash, 
      reviewerWallet,
      hcsSequence: hcsResult.sequence,
      contractTxHash,
      onChainVerified: true
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error?.message || 'Failed to create L3 review' 
    });
  }
});

// Get reviews for a product
app.get('/api/v1/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await databaseService.getReviewsByProduct(productId);
    
    res.json({ 
      success: true, 
      data: { 
        productId, 
        reviews: reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          text: review.text,
          authorVerificationLevel: review.authorVerificationLevel,
          authorTrustScore: review.authorTrustScore,
          ipfsHash: review.ipfsHash,
          onChainVerified: review.onChainVerified,
          createdAt: review.createdAt
        }))
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to fetch reviews' 
    });
  }
});

// Get review content from IPFS
app.get('/api/v1/reviews/content/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Get review from database
    const review = await databaseService.getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    // Get content from IPFS
    const content = await ipfsService.getReviewContent(review.ipfsHash);
    
    res.json({ 
      success: true, 
      data: {
        reviewId: review.id,
        productId: review.productId,
        rating: review.rating,
        text: review.text,
        authorVerificationLevel: review.authorVerificationLevel,
        authorTrustScore: review.authorTrustScore,
        onChainVerified: review.onChainVerified,
        createdAt: review.createdAt,
        content: content // Full IPFS content
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to retrieve review content' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
