// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReviewAttestation {
    struct Attestation {
        string reviewId;
        string productId;
        string ipfsHash;
        uint8 rating;
        address reviewerWallet;
        uint256 timestamp;
        uint256 hcsSequence;
        bool verified;
    }

    // Storage
    mapping(string => Attestation) public attestations; // reviewId => Attestation
    mapping(string => string[]) public productReviews; // productId => reviewId[]
    mapping(address => uint256) public reviewerCount; // wallet => review count

    // Events
    event ReviewAttested(
        string indexed reviewId,
        string indexed productId,
        address indexed reviewer,
        uint256 timestamp
    );

    // Main function: Attest a review
    function attestReview(
        string calldata reviewId,
        string calldata productId,
        string calldata ipfsHash,
        uint8 rating,
        address reviewerWallet,
        uint256 hcsSequence
    ) external returns (bool) {
        // Validation
        require(rating >= 1 && rating <= 5, "Invalid rating");
        require(bytes(reviewId).length > 0, "Invalid reviewId");
        require(bytes(attestations[reviewId].reviewId).length == 0, "Already attested");
        require(reviewerWallet != address(0), "Invalid wallet");

        // Create attestation
        attestations[reviewId] = Attestation({
            reviewId: reviewId,
            productId: productId,
            ipfsHash: ipfsHash,
            rating: rating,
            reviewerWallet: reviewerWallet,
            timestamp: block.timestamp,
            hcsSequence: hcsSequence,
            verified: true
        });

        // Add to product reviews
        productReviews[productId].push(reviewId);

        // Update reviewer count
        reviewerCount[reviewerWallet] += 1;

        // Emit event
        emit ReviewAttested(reviewId, productId, reviewerWallet, block.timestamp);

        return true;
    }

    // Getter functions
    function getReviewAttestation(string calldata reviewId)
        external
        view
        returns (Attestation memory)
    {
        require(bytes(attestations[reviewId].reviewId).length > 0, "Not found");
        return attestations[reviewId];
    }

    function getProductReviews(string calldata productId)
        external
        view
        returns (string[] memory)
    {
        return productReviews[productId];
    }

    function isReviewAttested(string calldata reviewId)
        external
        view
        returns (bool)
    {
        return bytes(attestations[reviewId].reviewId).length > 0;
    }

    function getReviewerStats(address reviewer)
        external
        view
        returns (uint256)
    {
        return reviewerCount[reviewer];
    }
}

