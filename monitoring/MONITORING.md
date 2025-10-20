# On-Chain Monitoring

Simple script to check the status of on-chain operations.

## Usage

```bash
# Check status
pnpm run status

# Or directly
node monitoring/check-status.js
```

## What it checks

- ✅ **Database**: Number of on-chain verified reviews
- ✅ **HCS**: Number of messages in the topic
- ✅ **Contract**: Connectivity status
- ✅ **Recent reviews**: Shows latest on-chain reviews

## Output

```
🔍 Checking On-Chain Status...

📊 Database: 2 on-chain reviews
📨 HCS: 10 messages found
🔗 Contract: Connected

📋 Recent On-Chain Reviews:
1. product-456 - Rating: 5 - Level: 3
2. product-123 - Rating: 5 - Level: 3

🌐 Links:
HCS: https://testnet.hashscan.io/topic/0.0.7097974
Contract: https://testnet.hashscan.io/contract/0.0.7096788

✅ Status check complete!
```

## Verification Links

- **HCS Topic**: https://testnet.hashscan.io/topic/0.0.7097974
- **Smart Contract**: https://testnet.hashscan.io/contract/0.0.7096788
- **Contract EVM**: https://testnet.hashscan.io/contract/0xf1f0689e3a9ac73af634e8661d16e8f7de332a60

That's it! Simple and effective monitoring.
