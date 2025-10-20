# Monitoring Scripts

This folder contains scripts to monitor and verify on-chain operations.

## Files

- **`check-status.js`** - Main monitoring script (simple and fast)
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
- ✅ Contract connectivity
- ✅ Recent reviews summary

### `check-hcs.js`
- 📨 Lists all HCS messages
- 📊 Shows message details
- 🔍 Good for debugging HCS issues

### `simple-verify.js`
- 🔍 Basic verification
- 📊 Shows what's working
- ✅ Good for quick checks

### `verify-onchain.js`
- 🔍 Detailed contract queries
- 📊 Full attestation verification
- ⚠️ May fail if contract functions aren't implemented

## Usage

Most of the time, you just need:
```bash
pnpm run status
```

That's it! Simple and effective monitoring.
