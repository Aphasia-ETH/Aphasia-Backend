const { 
  Client, 
  AccountId, 
  PrivateKey, 
  Hbar,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery
} = require('@hashgraph/sdk');

// Contract ABI (simplified for the functions we need)
const REVIEW_ATTESTATION_ABI = [
  {
    "inputs": [
      {"name": "reviewId", "type": "string"},
      {"name": "productId", "type": "string"},
      {"name": "ipfsHash", "type": "string"},
      {"name": "rating", "type": "uint8"},
      {"name": "reviewerWallet", "type": "address"},
      {"name": "hcsSequence", "type": "uint256"}
    ],
    "name": "attestReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "reviewId", "type": "string"}],
    "name": "getReviewAttestation",
    "outputs": [
      {
        "components": [
          {"name": "reviewId", "type": "string"},
          {"name": "productId", "type": "string"},
          {"name": "ipfsHash", "type": "string"},
          {"name": "rating", "type": "uint8"},
          {"name": "reviewerWallet", "type": "address"},
          {"name": "hcsSequence", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class ContractService {
  constructor() {
    this.contractAddress = process.env.REVIEW_ATTESTATION_ADDRESS;
    this.privateKey = process.env.HEDERA_PRIVATE_KEY;
    
    if (!this.contractAddress || !this.privateKey || this.contractAddress.trim() === '' || this.privateKey.trim() === '') {
      console.warn('⚠️  Contract credentials not found. Using mock contract service.');
      this.mockMode = true;
      return;
    }

    this.mockMode = false;
    this.initializeClients();
    console.log('✅ Contract service initialized');
  }

  initializeClients() {
    // Initialize Hedera client
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
      PrivateKey.fromStringECDSA(this.privateKey)
    );
    this.client.setDefaultMaxTransactionFee(new Hbar(1));
    this.client.setDefaultMaxQueryPayment(new Hbar(1));
  }

  async attestReview(reviewId, productId, ipfsHash, rating, reviewerWallet, hcsSequence) {
    if (this.mockMode) {
      return this.mockAttestation(reviewId, productId, ipfsHash, rating);
    }

    try {
      // Convert EVM address to Hedera contract ID
      // The contract was deployed to 0.0.7096788 (from your earlier deployment)
      const contractId = '0.0.7096788';
      
      const contractExecuteTransaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction(
          'attestReview',
          new ContractFunctionParameters()
            .addString(reviewId)
            .addString(productId)
            .addString(ipfsHash)
            .addUint8(parseInt(rating))
            .addAddress(reviewerWallet)
            .addUint256(Number(hcsSequence))
        );

      const response = await contractExecuteTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      console.log(`✅ Contract attestation submitted: ${response.transactionId.toString()}`);
      return response.transactionId.toString();
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
      const contractId = '0.0.7096788';
      
      const contractCallQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          'getReviewAttestation',
          new ContractFunctionParameters().addString(reviewId)
        );

      const response = await contractCallQuery.execute(this.client);
      return response;
    } catch (error) {
      console.error('❌ Contract query failed:', error.message);
      throw new Error(`Contract query failed: ${error.message}`);
    }
  }

  // Mock implementations
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
      timestamp: BigInt(Date.now())
    };
  }
}

module.exports = new ContractService();
