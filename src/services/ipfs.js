const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataJWT = process.env.PINATA_JWT;
    
    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      console.warn('⚠️  Pinata credentials not found. Using mock IPFS service.');
      this.mockMode = true;
    } else {
      this.mockMode = false;
      console.log('✅ IPFS service initialized with Pinata');
    }
  }

  async uploadReviewContent(content) {
    if (this.mockMode) {
      return this.mockUpload(content);
    }

    try {
      const formData = new FormData();
      formData.append('file', JSON.stringify(content), {
        filename: `review-${content.reviewId}.json`,
        contentType: 'application/json'
      });

      const metadata = JSON.stringify({
        name: `Review ${content.reviewId}`,
        keyvalues: {
          reviewId: content.reviewId,
          productId: content.productId,
          authorId: content.authorId,
          rating: content.rating.toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', options);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
          ...formData.getHeaders()
        }
      });

      console.log(`✅ Review ${content.reviewId} uploaded to IPFS: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      console.error('❌ IPFS upload failed:', error.response?.data || error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  async getReviewContent(hash) {
    if (this.mockMode) {
      return this.mockGet(hash);
    }

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
      console.log(`✅ Review content retrieved from IPFS: ${hash}`);
      return response.data;
    } catch (error) {
      console.error('❌ IPFS retrieval failed:', error.response?.data || error.message);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  // Mock implementations for when Pinata is not configured
  async mockUpload(content) {
    const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔧 Mock IPFS upload: ${content.reviewId} -> ${mockHash}`);
    return mockHash;
  }

  async mockGet(hash) {
    const mockContent = {
      reviewId: 'mock-review',
      productId: 'mock-product',
      rating: 5,
      text: 'This is mock content retrieved from IPFS',
      authorId: 'mock-author',
      timestamp: Date.now()
    };
    console.log(`🔧 Mock IPFS retrieval: ${hash}`);
    return mockContent;
  }
}

module.exports = new IPFSService();
