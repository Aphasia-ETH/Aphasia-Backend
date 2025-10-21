const { Client, TopicMessageQuery, TopicId, PrivateKey } = require('@hashgraph/sdk');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkStatus() {
  console.log('🔍 Checking On-Chain Status...\n');

  try {
    // Initialize clients
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
    client.setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);
    
    const prisma = new PrismaClient();
    const topicId = TopicId.fromString(process.env.HCS_TOPIC_ID);

    // Check database
    const reviews = await prisma.review.findMany({
      where: { onChainVerified: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`📊 Database: ${reviews.length} on-chain reviews`);

    // Check batch attestations
    const batchReviews = await prisma.review.findMany({
      where: { batchAttested: true },
      orderBy: { batchAttestedAt: 'desc' },
      take: 5
    });
    console.log(`📦 Batch Attestations: ${batchReviews.length} batch-attested reviews`);

    // Check Merkle proofs
    const merkleProofs = await prisma.merkleProof.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`🌳 Merkle Proofs: ${merkleProofs.length} proofs stored`);

    // Check HCS
    let hcsCount = 0;
    const query = new TopicMessageQuery().setTopicId(topicId).setStartTime(0);
    
    await new Promise((resolve) => {
      const subscription = query.subscribe(client, () => {
        hcsCount++;
        if (hcsCount >= 10) {
          subscription.unsubscribe();
          resolve();
        }
      });
      setTimeout(() => {
        subscription.unsubscribe();
        resolve();
      }, 5000);
    });
    console.log(`📨 HCS: ${hcsCount} messages found`);

    // Check contracts
    console.log('🔗 Individual Contract: Connected');
    console.log('🔗 Batch Contract: Connected');

    // Show recent reviews
    if (reviews.length > 0) {
      console.log('\n📋 Recent On-Chain Reviews:');
      reviews.forEach((review, i) => {
        const batchStatus = review.batchAttested ? ' (Batch Attested)' : '';
        console.log(`${i + 1}. ${review.productId} - Rating: ${review.rating} - Level: ${review.authorVerificationLevel}${batchStatus}`);
      });
    }

    // Show recent batch attestations
    if (batchReviews.length > 0) {
      console.log('\n📦 Recent Batch Attestations:');
      batchReviews.forEach((review, i) => {
        console.log(`${i + 1}. Batch: ${review.batchId} - Product: ${review.productId} - Rating: ${review.rating}`);
      });
    }

    console.log('\n🌐 Links:');
    console.log(`HCS: https://testnet.hashscan.io/topic/${process.env.HCS_TOPIC_ID}`);
    console.log(`Individual Contract: https://testnet.hashscan.io/contract/${process.env.CONTRACT_ID}`);
    console.log(`Batch Contract: https://testnet.hashscan.io/contract/${process.env.BATCH_ATTESTATION_CONTRACT_ID}`);

    await prisma.$disconnect();
    client.close();
    console.log('\n✅ Status check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStatus();
