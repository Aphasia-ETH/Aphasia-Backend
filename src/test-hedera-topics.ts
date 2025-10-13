// src/test-hedera-topics.ts
import { createTopics } from './scripts/create-topics.ts';

async function test() {
  console.log('Testing topic creation...');
  const topics = await createTopics();
  console.log('Test complete. Created topics:', topics);
}

test();
