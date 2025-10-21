// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BatchReviewAttestation {
    
    // Batch structure - one transaction for multiple reviews
    struct ReviewBatch {
        bytes32 merkleRoot;        // Root of review Merkle tree
        uint64 hcsTopicId;         // HCS topic reference
        uint64 startSequence;      // First HCS sequence in batch
        uint64 endSequence;        // Last HCS sequence in batch
        uint32 reviewCount;        // Number of reviews in batch
        uint32 timestamp;          // Batch timestamp
        string batchId;            // Unique batch identifier
    }
    
    // Efficient storage
    mapping(string => ReviewBatch) public batches;           // batchId => Batch
    mapping(bytes32 => string) public reviewToBatch;         // reviewHash => batchId
    mapping(string => bytes32[]) public productBatches;      // productId => batchIds[]
    
    // Events
    event BatchAttested(
        string indexed batchId,
        bytes32 merkleRoot,
        uint32 reviewCount,
        uint64 startSequence,
        uint64 endSequence
    );
    
    event ReviewVerified(
        bytes32 indexed reviewHash,
        string batchId
    );
    
    /**
     * @notice Attest a batch of reviews with a single transaction
     * @param batchId Unique batch identifier
     * @param merkleRoot Merkle root of all reviews in batch
     * @param hcsTopicId HCS topic ID
     * @param startSequence First HCS sequence number
     * @param endSequence Last HCS sequence number
     * @param reviewCount Number of reviews in batch
     * @param reviewHashes Array of review hashes for indexing
     * @param productIds Array of product IDs for indexing
     */
    function attestBatch(
        string memory batchId,
        bytes32 merkleRoot,
        uint64 hcsTopicId,
        uint64 startSequence,
        uint64 endSequence,
        uint32 reviewCount,
        bytes32[] memory reviewHashes,
        string[] memory productIds
    ) external {
        require(bytes(batches[batchId].batchId).length == 0, "Batch already exists");
        require(reviewHashes.length == reviewCount, "Invalid review count");
        require(productIds.length == reviewCount, "Invalid product count");
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        
        // Store batch
        batches[batchId] = ReviewBatch({
            merkleRoot: merkleRoot,
            hcsTopicId: hcsTopicId,
            startSequence: startSequence,
            endSequence: endSequence,
            reviewCount: reviewCount,
            timestamp: uint32(block.timestamp),
            batchId: batchId
        });
        
        // Index reviews to batch
        for (uint256 i = 0; i < reviewCount; i++) {
            reviewToBatch[reviewHashes[i]] = batchId;
            productBatches[productIds[i]].push(reviewHashes[i]);
        }
        
        emit BatchAttested(batchId, merkleRoot, reviewCount, startSequence, endSequence);
    }
    
    /**
     * @notice Verify a review is part of an attested batch
     * @param reviewHash Hash of the review
     * @param merkleProof Merkle proof for the review
     */
    function verifyReview(
        bytes32 reviewHash,
        bytes32[] memory merkleProof
    ) external view returns (bool) {
        string memory batchId = reviewToBatch[reviewHash];
        require(bytes(batchId).length > 0, "Review not found in any batch");
        
        ReviewBatch memory batch = batches[batchId];
        return verifyMerkleProof(merkleProof, batch.merkleRoot, reviewHash);
    }
    
    /**
     * @notice Get batch information for a review
     */
    function getReviewBatch(bytes32 reviewHash) external view returns (ReviewBatch memory) {
        string memory batchId = reviewToBatch[reviewHash];
        require(bytes(batchId).length > 0, "Review not found");
        return batches[batchId];
    }
    
    /**
     * @notice Get all review hashes for a product
     */
    function getProductReviews(string memory productId) external view returns (bytes32[] memory) {
        return productBatches[productId];
    }
    
    /**
     * @notice Verify Merkle proof
     */
    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == root;
    }
}
