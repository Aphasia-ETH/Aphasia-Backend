import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import FormData from 'form-data';
import ipfsConfig from '../../config/ipfs.ts';
import { logger } from '../../utils/logger.ts';

export class IPFSService {
  /**
   * Upload JSON data to IPFS via Pinata
   */
  static async uploadJSON(data: object): Promise<string> {
    try {
      const response = await axios.post(
        `${ipfsConfig.pinataUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: {
            name: `aphasia-${Date.now()}.json`,
          },
        },
        {
          headers: {
            pinata_api_key: ipfsConfig.pinataApiKey!,
            pinata_secret_api_key: ipfsConfig.pinataSecretKey!,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      logger.info('JSON uploaded to IPFS:', { ipfsHash });
      return ipfsHash;
    } catch (error) {
      logger.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload file buffer to IPFS via Pinata
   */
  static async uploadFile(
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', buffer, filename);

      const response = await axios.post(
        `${ipfsConfig.pinataUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: ipfsConfig.pinataApiKey!,
            pinata_secret_api_key: ipfsConfig.pinataSecretKey!,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      logger.info('File uploaded to IPFS:', { ipfsHash, filename });
      return ipfsHash;
    } catch (error) {
      logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Retrieve content from IPFS
   */
  static async getContent(ipfsHash: string): Promise<any> {
  const url = `${ipfsConfig.gatewayUrl}/${ipfsHash}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ipfsConfig.pinataJwt}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`Failed to retrieve content from IPFS at ${url}:`, error);
    throw error;
  }
}


  /**
   * Get IPFS gateway URL
   */
  static getGatewayUrl(ipfsHash: string): string {
    return `${ipfsConfig.gatewayUrl}/${ipfsHash}`;
  }
}

export default IPFSService;
