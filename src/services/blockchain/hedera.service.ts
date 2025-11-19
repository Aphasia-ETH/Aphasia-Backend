import { publicClient, walletClient } from '../../config/evm.ts';
import * as fs from 'fs';
import * as path from 'path';

const REVIEW_ATTESTATION_ADDRESS = process.env.REVIEW_ATTESTATION_ADDRESS as `0x${string}` | undefined;

// Lazy load contract artifact to avoid startup errors if contracts aren't compiled
let reviewAttestationAbi: any = null;

function loadContractArtifact() {
  if (reviewAttestationAbi) {
    return reviewAttestationAbi;
  }

  const artifactPath = path.join(__dirname, '../../../contracts/artifacts/contracts/ReviewAttestation.sol/ReviewAttestation.json');
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found at ${artifactPath}. ` +
      `Please compile the contracts first by running: cd contracts && npm run compile`
    );
  }

  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    reviewAttestationAbi = artifact.abi;
    return reviewAttestationAbi;
  } catch (error) {
    throw new Error(`Failed to load contract artifact: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export class HederaEvmService {
  static ensureConfig() {
    if (!REVIEW_ATTESTATION_ADDRESS) throw new Error('REVIEW_ATTESTATION_ADDRESS missing');
    if (!walletClient) throw new Error('Wallet client not initialized (HEDERA_PRIVATE_KEY missing)');
  }

  static getContract() {
    this.ensureConfig();
    const abi = loadContractArtifact();
    return {
      address: REVIEW_ATTESTATION_ADDRESS!,
      abi,
    };
  }

  static async attestReview(params: {
    reviewId: string;
    productId: string;
    ipfsHash: string;
    rating: number;
    reviewerWallet: `0x${string}`;
    hcsSequence: bigint;
  }) {
    this.ensureConfig();
    const contract = this.getContract();
    const hash = await walletClient!.writeContract({
      ...contract,
      functionName: 'attestReview',
      args: [
        params.reviewId,
        params.productId,
        params.ipfsHash,
        params.rating,
        params.reviewerWallet,
        params.hcsSequence,
      ],
    } as any);
    return hash;
  }

  static async getReviewAttestation(reviewId: string) {
    const contract = this.getContract();
    return publicClient.readContract({
      ...contract,
      functionName: 'getReviewAttestation',
      args: [reviewId],
    } as any);
  }

  static async getProductReviews(productId: string) {
    const contract = this.getContract();
    return publicClient.readContract({
      ...contract,
      functionName: 'getProductReviews',
      args: [productId],
    } as any);
  }
}

export default HederaEvmService;
