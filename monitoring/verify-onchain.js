const { Client, ContractCallQuery, ContractId, PrivateKey } = require('@hashgraph/sdk');
require('dotenv').config();

async function verifyOnChainReviews() {
  console.log('🔍 Verifying On-Chain Review Attestations...\n');

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);

  const contractId = ContractId.fromString(process.env.CONTRACT_ID);
  const topicId = process.env.HCS_TOPIC_ID;

  console.log(`📋 Contract ID: ${contractId}`);
  console.log(`📋 HCS Topic ID: ${topicId}\n`);

  try {
    // Test data from our L3 review - using the actual data from HCS
    const testReviewId = "l3-final-test"; // From HCS message sequence 14
    const testProductId = "product-456"; // From HCS message sequence 14
    const testRating = 5;
    const testHcsSequence = "14"; // From HCS message sequence 14

    console.log('🔍 Checking if review is attested on-chain...');
    console.log(`Review ID: ${testReviewId}`);
    console.log(`Product ID: ${testProductId}`);
    console.log(`Rating: ${testRating}`);
    console.log(`HCS Sequence: ${testHcsSequence}\n`);

    // Query the smart contract to check if review is attested
    const contractQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("isReviewAttested", new ContractFunctionParameters()
        .addString(testReviewId)
        .addString(testProductId)
      );

    const contractResponse = await contractQuery.execute(client);
    const isAttested = contractResponse.getBool(0);

    console.log(`✅ Contract Query Result: Review is ${isAttested ? 'ATTESTED' : 'NOT ATTESTED'} on-chain`);

    if (isAttested) {
      // Get the attestation details
      const attestationQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getReviewAttestation", new ContractFunctionParameters()
          .addString(testReviewId)
          .addString(testProductId)
        );

      const attestationResponse = await attestationQuery.execute(client);
      
      console.log('\n📊 Attestation Details:');
      console.log(`Review ID: ${attestationResponse.getString(0)}`);
      console.log(`Product ID: ${attestationResponse.getString(1)}`);
      console.log(`Rating: ${attestationResponse.getUint8(2)}`);
      console.log(`HCS Sequence: ${attestationResponse.getUint256(3)}`);
      console.log(`Timestamp: ${new Date(Number(attestationResponse.getUint256(4)) * 1000).toISOString()}`);
      console.log(`Reviewer: ${attestationResponse.getString(5)}`);
    }

    console.log('\n🌐 Verification Links:');
    console.log(`HCS Topic: https://testnet.hashscan.io/topic/${topicId}`);
    console.log(`Contract: https://testnet.hashscan.io/contract/${contractId}`);
    console.log(`Contract EVM: https://testnet.hashscan.io/contract/0xf1f0689e3a9ac73af634e8661d16e8f7de332a60`);

  } catch (error) {
    console.error('❌ Error verifying on-chain attestations:', error.message);
  }

  client.close();
}

// Import ContractFunctionParameters
const { ContractFunctionParameters } = require('@hashgraph/sdk');

verifyOnChainReviews().catch(console.error);
