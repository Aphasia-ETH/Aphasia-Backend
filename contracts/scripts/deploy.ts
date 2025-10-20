import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying ReviewAttestation to Hedera Testnet...\n");

  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", Number(balance) / 1e18, "HBAR\n");

  console.log("Deploying contract...");
  const contract = await viem.deployContract("ReviewAttestation");

  console.log("✅ ReviewAttestation deployed to:", contract.address);

  console.log("\n📝 Save this address to your .env file:");
  console.log(`REVIEW_ATTESTATION_ADDRESS=${contract.address}`);

  console.log("\n🔍 Verify on Hashscan:");
  console.log(`https://testnet.hashscan.io/testnet/contract/${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


