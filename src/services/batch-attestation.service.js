const { 
  Client, 
  AccountId, 
  PrivateKey, 
  Hbar,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery
} = require('@hashgraph/sdk');
const { MerkleTree } = require('merkletreejs');
const { createHash } = require('crypto');

class BatchAttestationService {
  constructor() {
    this.pendingReviews = [];
    this.batchSize = 100; // Attest every 100 reviews
    this.batchTimeout = 3600000; // Or every 1 hour
    this.lastBatchTime = Date.now();
    this.contractId = process.env.CONTRACT_ID || '0.0.7096788'; // Current individual contract ID
    this.batchContractId = process.env.BATCH_ATTESTATION_CONTRACT_ID; // Batch contract ID
    
    // Initialize Hedera client
    this.initializeClient();
    
    // Check if batch contract is available
    if (this.batchContractId) {
      console.log('✅ Batch Attestation Service initialized for batch contract:', this.batchContractId);
    } else {
      console.warn('⚠️  Batch Attestation Service running in mock mode. Set BATCH_ATTESTATION_CONTRACT_ID to enable real attestation.');
    }
  }

  initializeClient() {
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      console.warn('⚠️  Hedera credentials not found. Using mock batch service.');
      this.mockMode = true;
      return;
    }

    this.mockMode = false;
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
    );
    this.client.setDefaultMaxTransactionFee(new Hbar(1));
    this.client.setDefaultMaxQueryPayment(new Hbar(1));
    
    console.log('✅ Batch attestation service initialized');
  }

  /**
   * Add review to pending batch
   */
  async addReviewToBatch(review) {
    console.log(`📝 Adding review ${review.reviewId} to batch queue`);
    
    this.pendingReviews.push({
      reviewId: review.reviewId,
      productId: review.productId,
      ipfsHash: review.ipfsHash,
      rating: review.rating,
      reviewerWallet: review.reviewerWallet,
      hcsSequence: review.hcsSequence,
      timestamp: Date.now()
    });
    
    // Check if we should trigger batch attestation
    if (this.shouldAttest()) {
      await this.attestBatch();
    }
  }

  /**
   * Determine if batch should be attested
   */
  shouldAttest() {
    const timeElapsed = Date.now() - this.lastBatchTime;
    return (
      this.pendingReviews.length >= this.batchSize ||
      timeElapsed >= this.batchTimeout
    );
  }

  /**
   * Attest batch to smart contract
   */
  async attestBatch() {
    if (this.pendingReviews.length === 0) return;

    const reviews = [...this.pendingReviews];
    this.pendingReviews = [];
    this.lastBatchTime = Date.now();

    console.log(`🚀 Attesting batch of ${reviews.length} reviews...`);

    try {
      // 1. Build Merkle tree
      const { merkleRoot, reviewHashes, tree } = this.buildMerkleTree(reviews);
      
      // 2. Generate batch ID
      const batchId = this.generateBatchId(reviews);
      
      // 3. Get HCS sequence range
      const startSequence = Math.min(...reviews.map(r => r.hcsSequence));
      const endSequence = Math.max(...reviews.map(r => r.hcsSequence));
      
      // 4. Extract product IDs
      const productIds = reviews.map(r => r.productId);
      
      // 5. Submit to smart contract
      const receipt = await this.submitBatchAttestation({
        batchId,
        merkleRoot,
        hcsTopicId: process.env.HCS_TOPIC_ID || '12345',
        startSequence,
        endSequence,
        reviewCount: reviews.length,
        reviewHashes,
        productIds
      });
      
      // 6. Store Merkle proofs in database for later verification
      await this.storeMerkleProofs(reviews, tree, batchId);
      
      // 7. Update database with batch info
      await this.updateReviewsWithBatchInfo(reviews, batchId, receipt.transactionHash);
      
      console.log(`✅ Batch ${batchId} attested: ${reviews.length} reviews`);
      console.log(`   Transaction: ${receipt.transactionHash}`);
      console.log(`   Gas used: ${receipt.gasUsed}`);
      console.log(`   Per review cost: $${(receipt.cost / reviews.length).toFixed(6)}`);
      
      return {
        batchId,
        reviewCount: reviews.length,
        transactionHash: receipt.transactionHash,
        costPerReview: receipt.cost / reviews.length
      };
      
    } catch (error) {
      console.error('❌ Batch attestation failed:', error);
      // Put reviews back in queue for retry
      this.pendingReviews.unshift(...reviews);
      throw error;
    }
  }

  /**
   * Build Merkle tree from reviews
   */
  buildMerkleTree(reviews) {
    // Create leaf hashes
    const leaves = reviews.map(review => {
      const data = JSON.stringify({
        reviewId: review.reviewId,
        productId: review.productId,
        ipfsHash: review.ipfsHash,
        rating: review.rating,
        wallet: review.reviewerWallet,
        hcsSequence: review.hcsSequence
      });
      return createHash('sha256').update(data).digest();
    });
    
    // Build Merkle tree
    const tree = new MerkleTree(leaves, (data) => 
      createHash('sha256').update(data).digest(),
      { sortPairs: true }
    );
    
    const merkleRoot = '0x' + tree.getRoot().toString('hex');
    const reviewHashes = leaves.map(leaf => '0x' + leaf.toString('hex'));
    
    return { merkleRoot, reviewHashes, tree };
  }

  /**
   * Generate unique batch ID
   */
  generateBatchId(reviews) {
    const timestamp = Date.now();
    const reviewIds = reviews.map(r => r.reviewId).join(',');
    const hash = createHash('sha256')
      .update(`${timestamp}-${reviewIds}`)
      .digest('hex');
    return `batch-${hash.substring(0, 16)}`;
  }

  /**
   * Submit batch attestation to contract
   */
  async submitBatchAttestation(params) {
    if (this.mockMode) {
      return this.mockBatchAttestation(params);
    }

    if (!this.batchContractId) {
      console.warn('⚠️  Batch contract not deployed yet. Using mock mode.');
      return this.mockBatchAttestation(params);
    }

    try {
      const contractExecuteTransaction = new ContractExecuteTransaction()
        .setContractId(this.batchContractId)
        .setGas(1000000)
        .setFunction(
          'attestBatch',
          new ContractFunctionParameters()
            .addString(params.batchId)
            .addBytes32(Buffer.from(params.merkleRoot.substring(2), 'hex')) // Remove 0x prefix
            .addUint64(parseInt(params.hcsTopicId.replace('0.0.', '')))
            .addUint64(Number(params.startSequence))
            .addUint64(Number(params.endSequence))
            .addUint32(params.reviewCount)
            .addBytes32Array(params.reviewHashes.map(h => Buffer.from(h.substring(2), 'hex')))
            .addStringArray(params.productIds)
        );

      const response = await contractExecuteTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const gasUsed = receipt.gasUsed ? receipt.gasUsed.toNumber() : 0;
      const costInTinybar = gasUsed * 100000000; // Assuming 1 tinybar per gas unit
      const costInHbar = costInTinybar / 100_000_000;
      const costInUSD = costInHbar * 0.05; // Assuming $0.05 per HBAR
      
      return {
        transactionHash: response.transactionId.toString(),
        gasUsed,
        cost: costInUSD
      };
    } catch (error) {
      console.error('❌ Contract batch attestation failed:', error.message);
      throw new Error(`Contract batch attestation failed: ${error.message}`);
    }
  }

  /**
   * Store Merkle proofs in database
   */
  async storeMerkleProofs(reviews, tree, batchId) {
    console.log(`📊 Storing Merkle proofs for batch ${batchId}`);
    
    const databaseService = require('./database');
    
    for (const review of reviews) {
      const leafData = JSON.stringify({
        reviewId: review.reviewId,
        productId: review.productId,
        ipfsHash: review.ipfsHash,
        rating: review.rating,
        wallet: review.reviewerWallet,
        hcsSequence: review.hcsSequence
      });
      const leaf = createHash('sha256').update(leafData).digest();
      const proof = tree.getProof(leaf).map(p => '0x' + p.data.toString('hex'));
      
      console.log(`   Review ${review.reviewId}: proof length ${proof.length}`);
      
      // Store in database
      await databaseService.createMerkleProof({
        reviewId: review.reviewId,
        batchId,
        proof: JSON.stringify(proof),
        leaf: '0x' + leaf.toString('hex')
      });
    }
  }

  /**
   * Update reviews with batch information
   */
  async updateReviewsWithBatchInfo(reviews, batchId, txHash) {
    console.log(`📝 Updating ${reviews.length} reviews with batch info`);
    
    const databaseService = require('./database');
    
    for (const review of reviews) {
      console.log(`   Review ${review.reviewId} -> Batch ${batchId}`);
      
      // Update database
      await databaseService.updateReviewBatchInfo(review.reviewId, {
        batchId,
        batchTxHash: txHash,
        batchAttested: true,
        batchAttestedAt: new Date()
      });
    }
  }

  /**
   * Mock batch attestation for testing
   */
  async mockBatchAttestation(params) {
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    console.log(`🔧 Mock batch attestation: ${params.batchId} -> ${txHash}`);
    
    return {
      transactionHash: txHash,
      gasUsed: 200000, // Simulated gas usage
      cost: 0.10 // Simulated cost for batch
    };
  }

  /**
   * Get batch status
   */
  getBatchStatus() {
    return {
      pendingReviews: this.pendingReviews.length,
      batchSize: this.batchSize,
      timeUntilNextBatch: this.batchTimeout - (Date.now() - this.lastBatchTime),
      shouldAttest: this.shouldAttest()
    };
  }

  /**
   * Force batch attestation (for testing)
   */
  async forceBatchAttestation() {
    console.log('🔄 Forcing batch attestation...');
    return await this.attestBatch();
  }
}

module.exports = new BatchAttestationService();
