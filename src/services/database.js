const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DatabaseService {
  constructor() {
    console.log('✅ Database service initialized');
  }

  async createReview(reviewData) {
    try {
      const review = await prisma.review.create({
        data: {
          productId: reviewData.productId,
          productUrl: reviewData.productUrl || '',
          platform: reviewData.platform || 'aphasia',
          rating: reviewData.rating,
          title: reviewData.title || null,
          text: reviewData.text || '',
          images: reviewData.images || [],
          authorId: reviewData.authorId,
          authorVerificationLevel: reviewData.authorVerificationLevel,
          authorTrustScore: reviewData.authorTrustScore || 0,
          isAnonymous: reviewData.isAnonymous || false,
          ipfsHash: reviewData.ipfsHash,
          hederaSequence: reviewData.hederaSequence || '',
          hederaTopicId: reviewData.hederaTopicId || '',
          hederaTimestamp: reviewData.hederaTimestamp || new Date(),
          onChainVerified: reviewData.onChainVerified || false,
          helpfulCount: 0,
          reportCount: 0,
          status: 'active'
        }
      });
      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getReviewsByProduct(productId) {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' }
      });
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async getReviewById(reviewId) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId }
      });
      return review;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  }

  async updateReview(reviewId, updateData) {
    try {
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: updateData
      });
      return review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  async createOrGetUser(userData) {
    try {
      // Try to find existing user by privyUserId
      let user = await prisma.user.findUnique({
        where: { privyUserId: userData.privyUserId }
      });

      if (!user) {
        // Generate unique hederaDID if not provided
        const hederaDID = userData.hederaDID || `did:hedera:testnet:${userData.privyUserId}_${Date.now()}`;
        
        // Create new user
        user = await prisma.user.create({
          data: {
            privyUserId: userData.privyUserId,
            privyWallet: userData.privyWallet || '',
            hederaDID: hederaDID,
            email: userData.email || null,
            emailVerified: userData.emailVerified || false,
            verificationLevel: userData.verificationLevel || 0,
            trustScore: userData.trustScore || 0
          }
        });
      } else {
        // Update user if verification level is higher
        if (userData.verificationLevel > user.verificationLevel) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              verificationLevel: userData.verificationLevel,
              trustScore: userData.trustScore || user.trustScore
            }
          });
        }
      }
      return user;
    } catch (error) {
      console.error('Error creating/getting user:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
