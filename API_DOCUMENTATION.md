# Aphasia Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Reviews](#reviews)
4. [Batch Management](#batch-management)
5. [IPFS](#ipfs)
6. [Health Check](#health-check)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Register User
**POST** `/api/v1/auth/register`

Register a new user with email and password.

**Authentication**: Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "level": 1,
    "score": 0,
    "verifiedL1": true,
    "verifiedL2": false,
    "verifiedL3": false
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid email, password too short)
- `409` - User already exists

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

---

### Login
**POST** `/api/v1/auth/login`

Authenticate user and receive JWT token.

**Authentication**: Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "level": 1,
    "score": 0,
    "verifiedL1": true,
    "verifiedL2": false,
    "verifiedL3": false
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

---

### Get Current User
**GET** `/api/v1/auth/me`

Get the currently authenticated user's information.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "level": 1,
      "score": 0,
      "verifiedL1": true,
      "verifiedL2": false,
      "verifiedL3": false
    }
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Refresh Token
**POST** `/api/v1/auth/refresh`

Refresh the JWT token to extend session.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer <token>"
```

---

### Logout
**POST** `/api/v1/auth/logout`

Logout user (client-side token removal).

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## User Management

### Get User Profile
**GET** `/api/v1/user/profile`

Get the authenticated user's profile information.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "clx1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "level": 1,
  "score": 0,
  "verifiedL1": true,
  "verifiedL2": false,
  "verifiedL3": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Alternative Route**: `GET /api/v1/users/me` (backward compatibility)

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer <token>"
```

---

### Update User Profile
**PATCH** `/api/v1/user/profile`

Update the authenticated user's profile information.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response** (200 OK):
```json
{
  "id": "clx1234567890",
  "email": "newemail@example.com",
  "name": "Jane Doe",
  "level": 1,
  "score": 0,
  "verifiedL1": true,
  "verifiedL2": false,
  "verifiedL3": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid email format or email already taken
- `401` - Not authenticated

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

---

### Get User Statistics
**GET** `/api/v1/user/stats`

Get statistics for the authenticated user.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "totalReviews": 15,
  "level": 2,
  "score": 50,
  "achievements": [
    "First Review",
    "Reviewer",
    "Verified User"
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/user/stats \
  -H "Authorization: Bearer <token>"
```

---

## Reviews

### Create Level 1 Review
**POST** `/api/v1/reviews/l1`

Create a review for email-verified users (Level 1).

**Authentication**: Required

**Request Body:**
```json
{
  "reviewId": "review-123",
  "productId": "product-456",
  "rating": 5,
  "text": "Excellent product!",
  "authorId": "clx1234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "reviewId": "review-123",
    "productId": "product-456",
    "rating": 5,
    "ipfsHash": "QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61",
    "level": 1
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Not authenticated

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews/l1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "review-123",
    "productId": "product-456",
    "rating": 5,
    "text": "Excellent product!",
    "authorId": "clx1234567890"
  }'
```

---

### Create Level 2 Review
**POST** `/api/v1/reviews/l2`

Create a review for email + social verified users (Level 2).

**Authentication**: Required

**Request Body:**
```json
{
  "reviewId": "review-124",
  "productId": "product-456",
  "rating": 4,
  "text": "Good product with minor issues",
  "authorId": "clx1234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "reviewId": "review-124",
    "productId": "product-456",
    "rating": 4,
    "ipfsHash": "QmTPaMjHVtT7XDTpTbFqRiFecwKfrTWCV9qNKZCK8BQ68e",
    "level": 2
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews/l2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "review-124",
    "productId": "product-456",
    "rating": 4,
    "text": "Good product",
    "authorId": "clx1234567890"
  }'
```

---

### Create Level 3 Review
**POST** `/api/v1/reviews/l3`

Create a review with full blockchain integration (Level 3).

**Authentication**: Required

**Request Body:**
```json
{
  "reviewId": "review-125",
  "productId": "product-456",
  "rating": 5,
  "text": "Outstanding product with blockchain verification!",
  "authorId": "clx1234567890",
  "reviewerWallet": "0x1234567890123456789012345678901234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "reviewId": "review-125",
    "productId": "product-456",
    "rating": 5,
    "ipfsHash": "QmdMF1WgFgLMf9AknDWe4Wyq6iKPYDpH4fSsakbCQW93g4",
    "level": 3,
    "transactionHash": "0.0.7003610@1760987140.498673649",
    "hcsSequence": "15"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews/l3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "review-125",
    "productId": "product-456",
    "rating": 5,
    "text": "Outstanding product!",
    "authorId": "clx1234567890",
    "reviewerWallet": "0x1234567890123456789012345678901234567890"
  }'
```

---

### Create Level 3 Batch Review
**POST** `/api/v1/reviews/l3-batch`

Create a Level 3 review with batch optimization for cost reduction.

**Authentication**: Required

**Request Body:**
```json
{
  "productId": "product-456",
  "rating": 5,
  "text": "Excellent product!",
  "images": [],
  "reviewerWallet": "0x1234567890123456789012345678901234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "level": 3,
    "reviewId": "l3-batch-1705320000000-abc123",
    "productId": "product-456",
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
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews/l3-batch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-456",
    "rating": 5,
    "text": "Excellent product!",
    "reviewerWallet": "0x1234567890123456789012345678901234567890"
  }'
```

---

### Get Product Reviews
**GET** `/api/v1/reviews/product/:productId`

Retrieve all reviews for a specific product.

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "product-456",
    "reviews": [
      {
        "reviewId": "review-125",
        "productId": "product-456",
        "rating": 5,
        "text": "Outstanding product!",
        "authorId": "clx1234567890",
        "level": 3,
        "timestamp": 1705320000000
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/reviews/product/product-456 \
  -H "Authorization: Bearer <token>"
```

---

### Get Review Content
**GET** `/api/v1/reviews/content/:reviewId`

Retrieve full review content from IPFS.

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reviewId": "review-125",
    "content": "Outstanding product with blockchain verification!",
    "ipfsHash": "QmdMF1WgFgLMf9AknDWe4Wyq6iKPYDpH4fSsakbCQW93g4"
  }
}
```

**Error Responses:**
- `404` - Review not found

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/reviews/content/review-125 \
  -H "Authorization: Bearer <token>"
```

---

### Get Product Reviews Summary
**GET** `/api/v1/reviews/product/:productId/summary`

Get aggregated statistics for product reviews.

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "product-456",
    "totalReviews": 10,
    "averageRating": 4.5,
    "ratingDistribution": {
      "5": 6,
      "4": 3,
      "3": 1,
      "2": 0,
      "1": 0
    },
    "levelDistribution": {
      "l1": 5,
      "l2": 3,
      "l3": 2
    }
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/reviews/product/product-456/summary
```

---

## Batch Management

### Get Batch Status
**GET** `/api/v1/batch/status`

Get current batch processing status.

**Authentication**: Not required

**Response** (200 OK):
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

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/batch/status
```

---

### Force Batch Attestation
**POST** `/api/v1/batch/force`

Force immediate batch attestation (for testing/admin purposes).

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "batchId": "batch-8fb7c7610bcfac25",
    "reviewCount": 5,
    "merkleRoot": "0x1234567890abcdef...",
    "transactionHash": "0.0.7003610@1760998903.273731632",
    "costPerReview": 0.02
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/batch/force \
  -H "Authorization: Bearer <token>"
```

---

## IPFS

### Upload Content to IPFS
**POST** `/api/v1/ipfs/upload`

Upload content to IPFS and get a hash for storage.

**Authentication**: Required

**Request Body:**
```json
{
  "content": {
    "reviewId": "review-123",
    "productId": "product-456",
    "rating": 5,
    "text": "This product exceeded my expectations...",
    "images": ["https://example.com/image1.jpg"],
    "metadata": {
      "category": "electronics",
      "tags": ["quality", "durable"]
    }
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61",
    "pinataUrl": "https://gateway.pinata.cloud/ipfs/QmW4k4hjUTcP8nFJ4NSWvJqVauJqdKPAZA4ieThwigeR61"
  }
}
```

**Error Responses:**
- `400` - Missing content field
- `401` - Not authenticated
- `500` - IPFS upload failed

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/ipfs/upload \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Great product!",
      "rating": 5
    }
  }'
```

---

## Health Check

### Server Health
**GET** `/health`

Check if the server is running.

**Authentication**: Not required

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.0"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/health
```

---

## Error Handling

All endpoints return consistent error format:

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Validation errors, missing required fields |
| `401` | Unauthorized | Missing or invalid JWT token |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists (e.g., email taken) |
| `500` | Internal Server Error | Server-side error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required or token invalid |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate email) |
| `INTERNAL_ERROR` | Server error |

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required"
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Review not found"
  }
}
```

---

## Rate Limiting

Certain endpoints have rate limiting to prevent abuse:

- **Authentication endpoints**: Limited to prevent brute force attacks
- **Review creation**: Limited to prevent spam

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705320000
```

When rate limit is exceeded, response is:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```
Status code: `429 Too Many Requests`

---

## Verification Levels

| Level | Description | Trust Score | Blockchain | Requirements |
|-------|-------------|-------------|------------|--------------|
| **L1** | Email Verified | 0 | ❌ | Email verification only |
| **L2** | Social Verified | 50 | ❌ | Email + Social media verification |
| **L3** | Biometric Verified | 100 | ✅ | Email + Social + Biometric + Wallet |

### Level Benefits

- **L1**: Basic reviews, no blockchain verification
- **L2**: Higher trust score, social verification
- **L3**: Highest trust, full blockchain attestation, immutable records

---

## Blockchain Integration

### L3 Reviews Include:
- **HCS Message**: Immutable message on Hedera Consensus Service
- **Smart Contract Attestation**: On-chain proof via deployed contract
- **Transaction Hash**: Verifiable blockchain transaction
- **Batch Optimization**: Cost-effective batch attestation for L3 batch reviews

### Contract Details:
- **Network**: Hedera Testnet
- **HCS Topic**: Configured via `HCS_TOPIC_ID` environment variable
- **Contract ID**: Configured via `CONTRACT_ID` environment variable

---

## Frontend Integration Examples

### Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
    name: 'John Doe'
  })
});
const { token, user } = await registerResponse.json();

// 2. Store token
localStorage.setItem('jwt_token', token);

// 3. Use token for authenticated requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Complete Review Creation Flow

```javascript
// 1. Upload content to IPFS
const ipfsResponse = await fetch('http://localhost:3000/api/v1/ipfs/upload', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    content: {
      text: 'Great product!',
      rating: 5,
      productId: 'product-456'
    }
  })
});
const { data: { ipfsHash } } = await ipfsResponse.json();

// 2. Create review
const reviewResponse = await fetch('http://localhost:3000/api/v1/reviews/l1', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    reviewId: `review-${Date.now()}`,
    productId: 'product-456',
    rating: 5,
    text: 'Great product!',
    authorId: user.id
  })
});
const review = await reviewResponse.json();
```

### Get User Profile

```javascript
const profileResponse = await fetch('http://localhost:3000/api/v1/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const profile = await profileResponse.json();
```

---

## Environment Variables

Required environment variables:

```env
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aphasia_db"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Hedera (for L3 reviews)
HEDERA_ACCOUNT_ID="0.0.********"
HEDERA_PRIVATE_KEY="0x1**********"
HEDERA_NETWORK="testnet"
HCS_TOPIC_ID="0.0.***"
CONTRACT_ID="0.0.****"
BATCH_ATTESTATION_CONTRACT_ID="0.0.****"

# IPFS (Pinata) - Optional
PINATA_API_KEY="your_pinata_api_key"
PINATA_SECRET_KEY="your_pinata_secret"
PINATA_JWT="your_pinata_jwt"
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- IPFS hashes are unique and immutable
- Blockchain transactions are irreversible
- Trust scores are calculated based on verification level
- L3 reviews provide the highest trust and blockchain verification
- JWT tokens expire after 7 days (configurable)
- Passwords must be at least 6 characters
- Email addresses must be valid format

---

## Support

For issues or questions:
- Check error responses for detailed error messages
- Verify authentication token is valid and not expired
- Ensure all required fields are provided
- Check rate limiting if receiving 429 errors

---

**Last Updated**: January 2024
**API Version**: v1
