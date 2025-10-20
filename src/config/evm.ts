import dotenv from 'dotenv';
dotenv.config();

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const rpcUrl = process.env.HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api';
const privateKey = process.env.HEDERA_PRIVATE_KEY as `0x${string}` | undefined;

// Hedera Testnet chain (EVM)
export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
} as const;

export const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(rpcUrl),
});

export const walletClient = privateKey
  ? createWalletClient({
      chain: hederaTestnet,
      transport: http(rpcUrl),
      account: privateKeyToAccount(privateKey),
    })
  : undefined;

export default { publicClient, walletClient, hederaTestnet };


