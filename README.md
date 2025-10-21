# Aphasia Backend

Backend API for Aphasia - Verified Reviews powered by Web3.

## Tech Stack

- **Framework:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Blockchain:** Hedera (HCS + Smart Contracts)
- **Storage:** IPFS (Pinata)
- **Auth:** Email + JWT
- **Optimization:** Merkle Tree Batching (99% cost reduction)

## Setup

### Prerequisites

- Node.js 18+
- Neon database account
- Hedera testnet account
- Pinata account

### Installation
```bash
# Install dependencies
npm install

# Create .env with your credentials
cat > .env <<'ENV'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aphasia_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Hedera
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_PRIVATE_KEY=0x...
HEDERA_ACCOUNT_ID=0.0.xxxxxx
REVIEW_ATTESTATION_ADDRESS=0x...
CONTRACT_ID=0.0.xxxxxx
BATCH_ATTESTATION_ADDRESS=0x...
BATCH_ATTESTATION_CONTRACT_ID=0.0.xxxxxx
HCS_TOPIC_ID=0.0.xxxxxx

# Review weights
WEIGHT_L1=0.5
WEIGHT_L2=1.0
WEIGHT_L3=2.0

# IPFS (Pinata)
IPFS_URL=https://api.pinata.cloud
IPFS_PROJECT_ID=your-pinata-project-id
IPFS_PROJECT_SECRET=your-pinata-project-secret

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
ENV

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Start the server
npm run dev
```

## 🚀 Features

### Multi-Level Review System
- **L1 Reviews:** Email verification only
- **L2 Reviews:** Email + Social media verification  
- **L3 Reviews:** L2 + Biometric/Self Protocol verification

### Batch Optimization (99% Cost Reduction)
- **Merkle Tree Batching:** Groups multiple reviews into single on-chain transaction
- **Cost Reduction:** From ~$0.05-0.15 to ~$0.001-0.005 per review
- **Automatic Processing:** Batches every 100 reviews or 1 hour
- **Real-time Verification:** Immediate HCS + Batched contract attestation

### Blockchain Integration
- **Hedera Consensus Service (HCS):** Immutable message ordering
- **Smart Contracts:** Review attestation and verification
- **IPFS Storage:** Decentralized content storage via Pinata
- **Merkle Proofs:** Efficient verification of batch attestations

## 📊 API Endpoints

### Review Creation
- `POST /api/v1/reviews/l1` - Create L1 review
- `POST /api/v1/reviews/l2` - Create L2 review  
- `POST /api/v1/reviews/l3` - Create L3 review (individual)
- `POST /api/v1/reviews/l3-batch` - Create L3 review (batch optimized)

### Batch Management
- `GET /api/v1/batch/status` - Get batch processing status
- `POST /api/v1/batch/force` - Force batch attestation

### Content & Verification
- `GET /api/v1/reviews/product/:productId` - Get product reviews
- `GET /api/v1/reviews/content/:reviewId` - Get review content from IPFS
- `POST /api/v1/ipfs/upload` - Upload content to IPFS

## 🔧 Monitoring

### Check System Status
```bash
# Check on-chain status and batch attestations
npm run monitor

# Check batch optimization status
curl http://localhost:3000/api/v1/batch/status
```

### Hashscan Links
- **HCS Topic:** https://testnet.hashscan.io/topic/{HCS_TOPIC_ID}
- **Individual Contract:** https://testnet.hashscan.io/contract/{CONTRACT_ID}
- **Batch Contract:** https://testnet.hashscan.io/contract/{BATCH_ATTESTATION_CONTRACT_ID}
