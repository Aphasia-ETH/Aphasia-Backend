// src/scripts/create-topics.ts
import { Client, TopicCreateTransaction, PrivateKey } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID!;
const rawKey = process.env.HEDERA_PRIVATE_KEY!;

let privateKey: PrivateKey;
if (rawKey.startsWith('302e')) privateKey = PrivateKey.fromStringDer(rawKey);
else if (rawKey.startsWith('0x')) privateKey = PrivateKey.fromStringECDSA(rawKey);
else privateKey = PrivateKey.fromString(rawKey);

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

export async function createTopic(memo: string) {
  const tx = await new TopicCreateTransaction().setTopicMemo(memo).execute(client);
  const receipt = await tx.getReceipt(client);
  return receipt.topicId.toString();
}

export async function createTopics() {
  try {
    console.log('Creating HCS topics...\n');

    const verificationsTopicId = await createTopic('Aphasia - User Verifications');
    console.log('✅ Verifications topic created:', verificationsTopicId);

    const reviewsTopicId = await createTopic('Aphasia - Review Attestations');
    console.log('✅ Reviews topic created:', reviewsTopicId);

    console.log('\n📝 Add these to your .env file:');
    console.log(`HEDERA_TOPIC_ID_VERIFICATIONS=${verificationsTopicId}`);
    console.log(`HEDERA_TOPIC_ID_REVIEWS=${reviewsTopicId}`);

    return { verificationsTopicId, reviewsTopicId };
  } catch (error) {
    console.error('Error creating topics:', error);
    throw error;
  } finally {
    client.close();
  }
}

// ✅ ES module-compatible main check
if (import.meta.url === process.argv[1]) {
  createTopics();
}
