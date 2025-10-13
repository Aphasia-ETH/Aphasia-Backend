import dotenv from 'dotenv';
dotenv.config();
import { Client, AccountId, PrivateKey, Hbar } from '@hashgraph/sdk';

const network = process.env.HEDERA_NETWORK || 'testnet';
const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!accountId || !privateKey) {
  throw new Error('Hedera credentials not found in environment variables');
}

// Initialize Hedera client
const client =
  network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

client.setOperator(
  AccountId.fromString(accountId),
  PrivateKey.fromString(privateKey)
);
// Set default max transaction fee (1 HBAR)
client.setDefaultMaxTransactionFee(new Hbar(1));

// Set default max query payment (1 HBAR)
client.setDefaultMaxQueryPayment(new Hbar(1));

// Mirror node URLs
const mirrorNodeUrl =
  network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

const explorerUrl =
  network === 'mainnet'
    ? 'https://hashscan.io/mainnet'
    : 'https://hashscan.io/testnet';

export { client, mirrorNodeUrl, explorerUrl, network };
export default client;
