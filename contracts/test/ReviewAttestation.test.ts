import { describe, it, beforeEach } from "node:test";
import { expect } from "chai";
import { network } from "hardhat";

describe("ReviewAttestation", function () {
  let attestationContract: any;
  let publicClient: any;
  let deployer: any;
  let user1: any;

  beforeEach(async function () {
    const { viem } = await network.connect();
    publicClient = await viem.getPublicClient();
    const [deployerClient, user1Client] = await viem.getWalletClients();
    deployer = deployerClient;
    user1 = user1Client;

    attestationContract = await viem.deployContract("ReviewAttestation");
  });

  it("Should attest a review", async function () {
    const reviewId = "review-123";
    const productId = "amazon.com/dp/B08ABC123";
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const rating = 5;
    const hcsSequence = 123456;

    await attestationContract.write.attestReview([
      reviewId,
      productId,
      ipfsHash,
      rating,
      user1.account.address,
      hcsSequence,
    ]);

    const attestation: any = await attestationContract.read.getReviewAttestation([
      reviewId,
    ]);
    expect(attestation.reviewId ?? attestation[0]).to.equal(reviewId);
    const decodedRating = Number(attestation.rating ?? attestation[3]);
    expect(decodedRating).to.equal(rating);
  });

  it("Should prevent duplicate attestations", async function () {
    const reviewId = "review-123";

    await attestationContract.write.attestReview([
      reviewId,
      "product-1",
      "ipfs-hash",
      5,
      user1.account.address,
      1,
    ]);

    let threw = false;
    try {
      await attestationContract.write.attestReview([
        reviewId,
        "product-1",
        "ipfs-hash",
        4,
        user1.account.address,
        2,
      ]);
    } catch {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it("Should reject invalid ratings", async function () {
    let threwLow = false;
    try {
      await attestationContract.write.attestReview([
        "review-1",
        "product-1",
        "ipfs",
        0,
        user1.account.address,
        1,
      ]);
    } catch {
      threwLow = true;
    }
    expect(threwLow).to.equal(true);

    let threwHigh = false;
    try {
      await attestationContract.write.attestReview([
        "review-2",
        "product-1",
        "ipfs",
        6,
        user1.account.address,
        1,
      ]);
    } catch {
      threwHigh = true;
    }
    expect(threwHigh).to.equal(true);
  });

  it("Should track product reviews", async function () {
    const productId = "product-1";

    await attestationContract.write.attestReview([
      "review-1",
      productId,
      "ipfs-1",
      5,
      user1.account.address,
      1,
    ]);
    await attestationContract.write.attestReview([
      "review-2",
      productId,
      "ipfs-2",
      4,
      user1.account.address,
      2,
    ]);

    const reviews = await attestationContract.read.getProductReviews([
      productId,
    ]);
    expect(reviews.length).to.equal(2);
    expect(reviews[0]).to.equal("review-1");
    expect(reviews[1]).to.equal("review-2");
  });

  it("Should emit ReviewAttested event", async function () {
    const { viem } = await network.connect();
    const deploymentBlockNumber = await publicClient.getBlockNumber();
    await attestationContract.write.attestReview([
      "review-1",
      "product-1",
      "ipfs",
      5,
      user1.account.address,
      1,
    ]);

    const events = await publicClient.getContractEvents({
      address: attestationContract.address,
      abi: attestationContract.abi,
      eventName: "ReviewAttested",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });
    expect(events.length > 0).to.equal(true);
  });
});


