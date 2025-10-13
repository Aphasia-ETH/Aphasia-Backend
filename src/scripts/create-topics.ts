import { HCSService } from '../services/blockchain/hcs.service';
import { client } from '../config/hedera';

async function createTopics() {
  try {
    console.log('Creating HCS topics...\n');

    // Create verifications topic
    console.log('Creating verifications topic...');
    const verificationsTopicId = await HCSService.createTopic(
      'Aphasia - User Verifications'
    );
    console.log('✅ Verifications topic created:', verificationsTopicId);

    // Create reviews topic
    console.log('\nCreating reviews topic...');
    const reviewsTopicId = await HCSService.createTopic(
      'Aphasia - Review Attestations'
    );
    console.log('✅ Reviews topic created:', reviewsTopicId);

    console.log('\n📝 Add these to your .env file:');
    console.log(`HEDERA_TOPIC_ID_VERIFICATIONS=${verificationsTopicId}`);
    console.log(`HEDERA_TOPIC_ID_REVIEWS=${reviewsTopicId}`);

    client.close();
  } catch (error) {
    console.error('Error creating topics:', error);
    process.exit(1);
  }
}

createTopics();
