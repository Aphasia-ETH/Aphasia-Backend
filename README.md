# Aphasia Backend

Backend API for Aphasia - Verified Reviews powered by Web3.

## Tech Stack

- **Framework:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Blockchain:** Hedera (HCS + DID)
- **Storage:** IPFS (Pinata)
- **Auth:** Email + JWT

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
REVIEW_ATTESTATION_ADDRESS=0x...
HCS_TOPIC_ID=0.0.xxxxxx

# Review weights
WEIGHT_L1=0.5
WEIGHT_L2=1.0
WEIGHT_L3=2.0

# IPFS (for production, use Infura/Pinata)
IPFS_PINNING_SERVICE=local
# IPFS_URL=https://ipfs.infura.io:5001
# IPFS_PROJECT_ID=your-infura-project-id
# IPFS_PROJECT_SECRET=your-infura-project-secret

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
ENV

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
