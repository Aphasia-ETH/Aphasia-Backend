

import { client } from './config/hedera.ts';
import { AccountBalanceQuery } from '@hashgraph/sdk';


async function testHederaConnection() {
  try {
    console.log('Testing Hedera connection...');
    console.log('Network:', process.env.HEDERA_NETWORK);
    console.log('Account ID:', process.env.HEDERA_ACCOUNT_ID);

    // Query account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(process.env.HEDERA_ACCOUNT_ID!)
      .execute(client);

    console.log('\n✅ Hedera connection successful!');
    console.log('Account balance:', balance.hbars.toString());
    
    // Close client
    client.close();
  } catch (error) {
    console.error('❌ Hedera connection failed:', error);
    process.exit(1);
  }
}

testHederaConnection();
