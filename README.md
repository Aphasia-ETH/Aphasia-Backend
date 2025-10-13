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

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
