import { publicClient, walletClient } from '../../config/evm.ts';
import reviewAttestation from '../../../contracts/artifacts/contracts/ReviewAttestation.sol/ReviewAttestation.json' assert { type: 'json' };

const REVIEW_ATTESTATION_ADDRESS = process.env.REVIEW_ATTESTATION_ADDRESS as `0x${string}` | undefined;

export class HederaEvmService {
  static ensureConfig() {
    if (!REVIEW_ATTESTATION_ADDRESS) throw new Error('REVIEW_ATTESTATION_ADDRESS missing');
    if (!walletClient) throw new Error('Wallet client not initialized (HEDERA_PRIVATE_KEY missing)');
  }

  static getContract() {
    this.ensureConfig();
    return {
      address: REVIEW_ATTESTATION_ADDRESS!,
      abi: (reviewAttestation as any).abi,
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
