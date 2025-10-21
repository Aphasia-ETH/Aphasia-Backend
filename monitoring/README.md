# Monitoring Scripts

This folder contains scripts to monitor and verify on-chain operations.

## Files

- **`check-status.js`** - Main monitoring script 
- **`check-hcs.js`** - Check HCS messages only
- **`simple-verify.js`** - Simple verification script
- **`verify-onchain.js`** - Detailed contract verification
- **`MONITORING.md`** - Usage documentation

## Quick Start

```bash
# From project root
pnpm run status

# Or directly
node monitoring/check-status.js
```

## What Each Script Does

### `check-status.js` (Recommended)
- ✅ Database status
- ✅ HCS message count
- ✅ Contract connectivity (Individual + Batch)
- ✅ Recent reviews summary
- ✅ Batch attestation status
- ✅ Merkle proof storage

### `check-hcs.js`
- 📨 Lists all HCS messages
- 📊 Shows message details
- 🔍 Good for debugging HCS issues

### `simple-verify.js`
- 🔍 Basic verification
- 📊 Shows what's working


### `verify-onchain.js`
- 🔍 Detailed contract queries
- 📊 Full attestation verification

## Usage

Most of the time, you just need:
```bash
pnpm run status
```

That's it! Simple and effective monitoring.

## Batch Optimization Monitoring

The monitoring scripts now include batch optimization status:

- **Batch Attestations:** Shows reviews that have been batch-attested
- **Merkle Proofs:** Displays stored Merkle proofs for verification
- **Contract Links:** Links to both individual and batch contracts
- **Cost Tracking:** Monitors batch processing efficiency

### Batch Status API
```bash
# Check batch processing status
curl http://localhost:3000/api/v1/batch/status

# Force batch attestation (for testing)
curl -X POST http://localhost:3000/api/v1/batch/force
```
