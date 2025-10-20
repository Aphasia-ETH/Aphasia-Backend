const { Client, AccountId, PrivateKey, Hbar } = require('@hashgraph/sdk');
const axios = require('axios');

class HederaService {
  constructor() {
    this.network = process.env.HEDERA_NETWORK || 'testnet';
    this.accountId = process.env.HEDERA_ACCOUNT_ID;
    this.privateKey = process.env.HEDERA_PRIVATE_KEY;
    this.topicId = process.env.HCS_TOPIC_ID;
    
    if (!this.accountId || !this.privateKey || this.accountId.trim() === '' || this.privateKey.trim() === '') {
      console.warn('⚠️  Hedera credentials not found. Using mock Hedera service.');
      this.mockMode = true;
    } else {
      this.mockMode = false;
      this.initializeClient();
      console.log('✅ Hedera service initialized');
    }
  }

  initializeClient() {
    this.client = this.network === 'mainnet' 
      ? Client.forMainnet()
      : Client.forTestnet();

    this.client.setOperator(
      AccountId.fromString(this.accountId),
      PrivateKey.fromStringECDSA(this.privateKey)
    );
    this.client.setDefaultMaxTransactionFee(new Hbar(1));
    this.client.setDefaultMaxQueryPayment(new Hbar(1));
  }

  async submitHCSMessage(message) {
    if (this.mockMode) {
      return this.mockHCSMessage(message);
    }

    try {
      if (!this.topicId) {
        throw new Error('HCS_TOPIC_ID not configured');
      }

      const { TopicMessageSubmitTransaction, TopicId } = require('@hashgraph/sdk');
      
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(this.topicId))
        .setMessage(JSON.stringify(message));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      console.log(`✅ HCS message submitted: sequence ${receipt.topicSequenceNumber}`);
      return {
        sequence: receipt.topicSequenceNumber.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ HCS submission failed:', error.message);
      throw new Error(`HCS submission failed: ${error.message}`);
    }
  }

  async attestReview(reviewId, productId, ipfsHash, rating, reviewerWallet, hcsSequence) {
    if (this.mockMode) {
      return this.mockAttestation(reviewId, productId, ipfsHash, rating);
    }

    try {
      // This would interact with the deployed ReviewAttestation contract
      // For now, we'll mock the contract interaction
      console.log(`🔧 Mock contract attestation for review ${reviewId}`);
      return `0x${Math.random().toString(16).substr(2, 64)}`;
    } catch (error) {
      console.error('❌ Contract attestation failed:', error.message);
      throw new Error(`Contract attestation failed: ${error.message}`);
    }
  }

  async getReviewAttestation(reviewId) {
    if (this.mockMode) {
      return this.mockGetAttestation(reviewId);
    }

    try {
      // This would query the deployed ReviewAttestation contract
      console.log(`🔧 Mock contract query for review ${reviewId}`);
      return {
        reviewId,
        productId: 'mock-product',
        ipfsHash: 'QmMockHash',
        rating: 5,
        reviewerWallet: '0xMockWallet',
        hcsSequence: BigInt(1),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Contract query failed:', error.message);
      throw new Error(`Contract query failed: ${error.message}`);
    }
  }

  // Mock implementations
  async mockHCSMessage(message) {
    const sequence = Math.floor(Math.random() * 1000000);
    console.log(`🔧 Mock HCS message: sequence ${sequence}`);
    return { sequence: sequence.toString(), transactionId: 'mock-tx-id' };
  }

  async mockAttestation(reviewId, productId, ipfsHash, rating) {
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    console.log(`🔧 Mock attestation: ${reviewId} -> ${txHash}`);
    return txHash;
  }

  async mockGetAttestation(reviewId) {
    return {
      reviewId,
      productId: 'mock-product',
      ipfsHash: 'QmMockHash',
      rating: 5,
      reviewerWallet: '0xMockWallet',
      hcsSequence: BigInt(1),
      timestamp: Date.now()
    };
  }
}

module.exports = new HederaService();
