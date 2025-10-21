# Aphasia Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🚀 Batch Optimization Endpoints

### Create L3 Batch Review (Cost Optimized)
**POST** `/api/v1/reviews/l3-batch`

Create a Level 3 review with batch optimization for 99% cost reduction.

**Headers:**
```
x-user-id: <user_id>
x-wallet-address: <wallet_address>
```

**Request Body:**
```json
{
  "productId": "product-123",
  "rating": 5,
  "text": "Excellent product!",
  "images": []
}
```

**Response:**
```json
{
  "success": true,
  "level": 3,
  "reviewId": "cmgzp59il00047ukfve92el5f",
  "productId": "product-123",
  "rating": 5,
  "ipfsHash": "Qmbwsh3gE1h92G5GUzvSWA3sKgy9mP52CFU9YgBmzPFJiV",
  "reviewerWallet": "0x1234567890123456789012345678901234567890",
  "hcsSequence": "16",
  "onChainVerified": true,
  "verification": {
    "hcs": {
      "sequence": "16",
      "topicId": "0.0.7097974",
      "url": "https://hashscan.io/testnet/topic/0.0.7097974",
      "cost": "$0.0001",
      "status": "verified"
    },
    "batch": {
      "status": "pending",
      "message": "Will be included in next batch (every 100 reviews or 1 hour)",
      "estimatedCost": "$0.001 per review"
    }
  }
}
```

### Get Batch Status
**GET** `/api/v1/batch/status`

Get current batch processing status.

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingReviews": 3,
    "batchSize": 100,
    "batchTimeout": 3600000,
    "timeSinceLastBatch": 1234567,
    "shouldAttest": false,
    "nextBatchTrigger": "size"
  }
}
```

### Force Batch Attestation
**POST** `/api/v1/batch/force`

Force immediate batch attestation (for testing/admin purposes).

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch-8fb7c7610bcfac25",
    "reviewCount": 5,
    "merkleRoot": "0x1234567890abcdef...",
    "transactionHash": "0.0.7003610@1760998903.273731632",
    "cost": 0.10
  }
}
```

---

## 📁 IPFS Endpoints

### Upload Content to IPFS
**POST** `/api/v1/ipfs/upload`

Upload review content to IPFS (Pinata) and get a hash for storage.

**Request Body:**
```json
{
  "content": {
    "title": "Great product!",
    "text": "This product exceeded my expectations...",
    "images": ["https://example.com/image1.jpg"],
    "metadata": {
      "category": "electronics",
      "tags": ["quality", "durable"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61",
    "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61"
  }
}
```

---

## 📝 Review Endpoints

### Create L1 Review (Email Verified)
**POST** `/api/v1/reviews/l1`

Create a review for email-verified users (Level 1 verification).

**Request Body:**
```json
{
  "reviewId": "review-123",
  "productId": "product-456",
  "productUrl": "https://example.com/product",
  "rating": 5,
  "text": "Excellent product!",
  "ipfsHash": "QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61",
  "authorId": "user-789",
  "authorEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "review-123",
    "productId": "product-456",
    "rating": 5,
    "authorVerificationLevel": 1,
    "authorTrustScore": 0,
    "onChainVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Create L2 Review (Email + Social Verified)
**POST** `/api/v1/reviews/l2`

Create a review for email + social verified users (Level 2 verification).

**Request Body:**
```json
{
  "reviewId": "review-124",
  "productId": "product-456",
  "productUrl": "https://example.com/product",
  "rating": 4,
  "text": "Good product with minor issues",
  "ipfsHash": "QmTPaMjHVtT7XDTpTbFqRiFecwKfrTWCV9qNKZCK8BQ68e",
  "authorId": "user-790",
  "authorEmail": "user2@example.com",
  "socialVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "review-124",
    "productId": "product-456",
    "rating": 4,
    "authorVerificationLevel": 2,
    "authorTrustScore": 50,
    "onChainVerified": false,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

### Create L3 Review (Biometric Verified + Blockchain)
**POST** `/api/v1/reviews/l3`

Create a review for biometric verified users with full blockchain integration (Level 3 verification).

**Request Body:**
```json
{
  "reviewId": "review-125",
  "productId": "product-456",
  "productUrl": "https://example.com/product",
  "rating": 5,
  "text": "Outstanding product with blockchain verification!",
  "ipfsHash": "QmdMF1WgFgLMf9AknDWe4Wyq6iKPYDpH4fSsakbCQW93g4",
  "authorId": "user-791",
  "authorEmail": "user3@example.com",
  "reviewerWallet": "0x1234567890123456789012345678901234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "review-125",
    "productId": "product-456",
    "rating": 5,
    "authorVerificationLevel": 3,
    "authorTrustScore": 100,
    "onChainVerified": true,
    "hcsSequence": "15",
    "contractTxHash": "0.0.7003610@1760987140.498673649",
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

### Get Product Reviews
**GET** `/api/v1/reviews/product/:productId`

Retrieve all reviews for a specific product.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-125",
      "productId": "product-456",
      "rating": 5,
      "text": "Outstanding product with blockchain verification!",
      "authorVerificationLevel": 3,
      "authorTrustScore": 100,
      "onChainVerified": true,
      "createdAt": "2024-01-15T10:40:00Z"
    },
    {
      "id": "review-124",
      "productId": "product-456",
      "rating": 4,
      "text": "Good product with minor issues",
      "authorVerificationLevel": 2,
      "authorTrustScore": 50,
      "onChainVerified": false,
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### Get Review Content
**GET** `/api/v1/reviews/content/:reviewId`

Retrieve full review content including IPFS data.

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "review-125",
    "productId": "product-456",
    "rating": 5,
    "text": "Outstanding product with blockchain verification!",
    "authorVerificationLevel": 3,
    "authorTrustScore": 100,
    "onChainVerified": true,
    "createdAt": "2024-01-15T10:40:00Z",
    "content": {
      "title": "Outstanding product!",
      "text": "This product exceeded my expectations...",
      "images": ["https://example.com/image1.jpg"],
      "metadata": {
        "category": "electronics",
        "tags": ["quality", "durable"]
      }
    }
  }
}
```

---

## 🔍 Health Check

### Server Health
**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "ipfs": "connected",
    "hedera": "connected"
  }
}
```

---

## 📊 Verification Levels

| Level | Description | Trust Score | Blockchain | Requirements |
|-------|-------------|-------------|------------|--------------|
| **L1** | Email Verified | 0 | ❌ | Email verification only |
| **L2** | Social Verified | 50 | ❌ | Email + Social media verification |
| **L3** | Biometric Verified | 100 | ✅ | Email + Social + Biometric + Wallet |

---

## 🔗 Blockchain Integration

### L3 Reviews Include:
- **HCS Message**: Immutable message on Hedera Consensus Service
- **Smart Contract Attestation**: On-chain proof via deployed contract
- **Transaction Hash**: Verifiable blockchain transaction

### Contract Details:
- **Contract ID**: `0.0.7096788`
- **Network**: Hedera Testnet
- **HCS Topic**: `0.0.7097974`

---

## ⚠️ Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Frontend Integration Guide

### 1. Authentication Flow
```javascript
// Set JWT token for all requests
const token = localStorage.getItem('jwt_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Review Creation Flow
```javascript
// Step 1: Upload content to IPFS
const ipfsResponse = await fetch('/api/v1/ipfs/upload', {
  method: 'POST',
  headers,
  body: JSON.stringify({ content: reviewContent })
});
const { ipfsHash } = await ipfsResponse.json();

// Step 2: Create review with IPFS hash
const reviewResponse = await fetch('/api/v1/reviews/l3', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    reviewId: generateId(),
    productId: productId,
    rating: rating,
    text: text,
    ipfsHash: ipfsHash,
    authorId: userId,
    reviewerWallet: walletAddress
  })
});
```

### 3. Display Reviews
```javascript
// Get product reviews
const reviewsResponse = await fetch(`/api/v1/reviews/product/${productId}`, {
  headers
});
const reviews = await reviewsResponse.json();

// Get full content for specific review
const contentResponse = await fetch(`/api/v1/reviews/content/${reviewId}`, {
  headers
});
const fullContent = await contentResponse.json();
```

---

## 🔧 Environment Variables

Required environment variables for backend:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aphasia"

# Hedera
HEDERA_ACCOUNT_ID="0.0.********"
HEDERA_PRIVATE_KEY="0x1**********"
HEDERA_NETWORK="testnet"
HCS_TOPIC_ID="0.0.***"
CONTRACT_ID="0.0.****"

# IPFS (Pinata)
IPFS_URL="https://api.pinata.cloud"
IPFS_PROJECT_ID="your_pinata_project_id"
IPFS_PROJECT_SECRET="your_pinata_secret"

# JWT
JWT_SECRET="your_jwt_secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- IPFS hashes are unique and immutable
- Blockchain transactions are irreversible
- Trust scores are calculated based on verification level
- L3 reviews provide the highest trust and blockchain verification
