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
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_PRIVATE_KEY=0x...
REVIEW_ATTESTATION_ADDRESS=0x...
HCS_TOPIC_ID=0.0.xxxxxx

# Scoring weights
WEIGHT_L1=0.5
WEIGHT_L2=1.0
WEIGHT_L3=2.0
ENV

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
