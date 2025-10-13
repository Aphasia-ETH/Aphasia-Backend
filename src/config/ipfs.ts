import dotenv from 'dotenv';
dotenv.config();
const ipfsConfig = {
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretKey: process.env.PINATA_SECRET_KEY,
  pinataJwt: process.env.PINATA_JWT,
  pinataUrl: 'https://api.pinata.cloud',
  gatewayUrl: process.env.PINATA_GATEWAY
    ? `https://${process.env.PINATA_GATEWAY}/ipfs`
    : 'https://gateway.pinata.cloud/ipfs',
};


if (!ipfsConfig.pinataApiKey || !ipfsConfig.pinataSecretKey) {
  throw new Error('Pinata credentials are missing in environment variables');
}

export default ipfsConfig;
