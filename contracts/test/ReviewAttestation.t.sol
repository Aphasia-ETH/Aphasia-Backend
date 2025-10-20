// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ReviewAttestation} from "../contracts/ReviewAttestation.sol";

contract ReviewAttestationTest is Test {
    ReviewAttestation public attestation;
    address public user1 = address(0x1);

    function setUp() public {
        attestation = new ReviewAttestation();
    }

    function testAttestReview() public {
        string memory reviewId = "review-123";

        attestation.attestReview(
            reviewId,
            "product-1",
            "ipfs-hash",
            5,
            user1,
            12345
        );

        ReviewAttestation.Attestation memory att = attestation.getReviewAttestation(reviewId);
        assertEq(att.reviewId, reviewId);
        assertEq(att.rating, 5);
        assertEq(att.reviewerWallet, user1);
        assertTrue(att.verified);
    }

    function testRevertDuplicateAttestation() public {
        attestation.attestReview(
            "review-1",
            "product-1",
            "ipfs",
            5,
            user1,
            1
        );

        vm.expectRevert(bytes("Already attested"));
        attestation.attestReview(
            "review-1",
            "product-1",
            "ipfs",
            4,
            user1,
            2
        );
    }

    function testRejectInvalidRatings() public {
        vm.expectRevert(bytes("Invalid rating"));
        attestation.attestReview(
            "review-1",
            "product-1",
            "ipfs",
            0,
            user1,
            1
        );

        vm.expectRevert(bytes("Invalid rating"));
        attestation.attestReview(
            "review-2",
            "product-1",
            "ipfs",
            6,
            user1,
            1
        );
    }

    function testTrackProductReviews() public {
        string memory productId = "product-1";
        attestation.attestReview("review-1", productId, "ipfs-1", 5, user1, 1);
        attestation.attestReview("review-2", productId, "ipfs-2", 4, user1, 2);

        string[] memory reviews = attestation.getProductReviews(productId);
        assertEq(reviews.length, 2);
        assertEq(keccak256(bytes(reviews[0])), keccak256(bytes("review-1")));
        assertEq(keccak256(bytes(reviews[1])), keccak256(bytes("review-2")));
    }

    function testEmitReviewAttestedEvent() public {
        string memory reviewId = "review-evt";
        string memory productId = "product-evt";

        vm.expectEmit(true, true, true, false);
        emit ReviewAttestation.ReviewAttested(reviewId, productId, user1, block.timestamp);

        attestation.attestReview(
            reviewId,
            productId,
            "ipfs",
            5,
            user1,
            42
        );
    }
}


