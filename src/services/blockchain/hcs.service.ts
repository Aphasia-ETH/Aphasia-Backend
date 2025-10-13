import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from '@hashgraph/sdk';
import { client, mirrorNodeUrl } from '../../config/hedera.ts';
import axios from 'axios';

export class HCSService {
  /**
   * Create a new HCS topic
   */
  static async createTopic(memo: string): Promise<string> {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(memo);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const topicId = receipt.topicId;

      if (!topicId) {
        throw new Error('Failed to create topic');
      }

      console.log(`Topic created: ${topicId.toString()}`);
      return topicId.toString();
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Submit a message to an HCS topic
   */
  static async submitMessage(
    topicId: string,
    message: object
  ): Promise<{ sequence: string; timestamp: Date; transactionId: string }> {
    try {
      const messageString = JSON.stringify(message);

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(messageString);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      return {
        sequence: receipt.topicSequenceNumber?.toString() || '0',
        timestamp: new Date(),
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error) {
      console.error('Error submitting message:', error);
      throw error;
    }
  }

  /**
   * Get messages from a topic via Mirror Node
   */
  static async getTopicMessages(
    topicId: string,
    sequenceNumber?: string
  ): Promise<any[]> {
    try {
      let url = `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages`;
      
      if (sequenceNumber) {
        url += `/${sequenceNumber}`;
      }

      const response = await axios.get(url);
      return response.data.messages || [response.data];
    } catch (error) {
      console.error('Error getting topic messages:', error);
      throw error;
    }
  }

  /**
   * Verify a message exists on chain
   */
  static async verifyMessage(
    topicId: string,
    sequenceNumber: string
  ): Promise<boolean> {
    try {
      const messages = await this.getTopicMessages(topicId, sequenceNumber);
      return messages.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export default HCSService;
