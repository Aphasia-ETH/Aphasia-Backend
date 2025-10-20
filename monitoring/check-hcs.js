const { Client, TopicMessageQuery, TopicId, PrivateKey } = require('@hashgraph/sdk');
require('dotenv').config();

async function checkHCSMessages() {
  console.log('🔍 Checking HCS Messages...\n');

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);

  const topicId = TopicId.fromString(process.env.HCS_TOPIC_ID);

  console.log(`📋 HCS Topic ID: ${topicId}\n`);

  try {
    // Create a query to get recent messages from the topic
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0); // From the beginning

    let messageCount = 0;
    const messages = [];

    console.log('📨 Fetching HCS messages...\n');

    // Subscribe to messages
    await new Promise((resolve, reject) => {
      const subscription = query.subscribe(client, (message) => {
        messageCount++;
        const messageData = Buffer.from(message.contents).toString('utf8');
        const timestamp = new Date(Number(message.consensusTimestamp.seconds) * 1000).toISOString();
        
        console.log(`📨 Message ${messageCount}:`);
        console.log(`   Sequence: ${message.sequenceNumber}`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Content: ${messageData}`);
        console.log('');

        messages.push({
          sequence: message.sequenceNumber.toString(),
          timestamp,
          content: messageData
        });

        // Stop after getting more messages or timeout
        if (messageCount >= 20) {
          subscription.unsubscribe();
          resolve();
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        resolve();
      }, 10000);
    });

    console.log(`✅ Found ${messageCount} HCS messages`);
    
    if (messages.length > 0) {
      console.log('\n📊 Recent Messages Summary:');
      messages.forEach((msg, index) => {
        console.log(`${index + 1}. Sequence ${msg.sequence} - ${msg.timestamp}`);
        console.log(`   Content: ${msg.content.substring(0, 100)}...`);
      });
    }

    console.log('\n🌐 View on HashScan:');
    console.log(`https://testnet.hashscan.io/topic/${topicId}`);

  } catch (error) {
    console.error('❌ Error checking HCS messages:', error.message);
  }

  client.close();
}

checkHCSMessages().catch(console.error);
