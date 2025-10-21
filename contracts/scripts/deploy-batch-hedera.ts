import { config } from 'dotenv';
config({ path: '../.env' }); // Load environment variables from backend directory

import { 
  Client, 
  AccountId, 
  PrivateKey, 
  Hbar,
  ContractCreateTransaction,
  FileCreateTransaction,
  ContractBytecodeQuery
} from '@hashgraph/sdk';
import * as fs from 'fs';
import * as path from 'path';

async function deployBatchContract() {
  try {
    console.log('🚀 Deploying BatchReviewAttestation contract using Hedera SDK...');

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
    );
    client.setDefaultMaxTransactionFee(new Hbar(1));
    client.setDefaultMaxQueryPayment(new Hbar(1));

    console.log(`📍 Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
    console.log(`🔑 Private Key: ${process.env.HEDERA_PRIVATE_KEY ? 'Set' : 'Not set'}`);
    console.log(`🌐 Network: Testnet`);
    
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('Missing required environment variables: HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY');
    }

    // Read the compiled contract bytecode
    const artifactsPath = path.join(__dirname, '../artifacts/contracts/BatchReviewAttestation.sol/BatchReviewAttestation.json');
    
    if (!fs.existsSync(artifactsPath)) {
      throw new Error(`Contract artifacts not found at ${artifactsPath}. Please compile the contract first.`);
    }

    const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    const bytecode = contractArtifact.bytecode;

    if (!bytecode || bytecode === '0x') {
      throw new Error('Contract bytecode is empty. Please compile the contract first.');
    }

    console.log('📦 Contract bytecode loaded successfully');

    // Create file on Hedera
    console.log('📄 Creating contract file on Hedera...');
    const fileCreateTx = new FileCreateTransaction()
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(1));

    const fileCreateResponse = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateResponse.getReceipt(client);
    const fileId = fileCreateReceipt.fileId!;

    console.log(`✅ Contract file created: ${fileId.toString()}`);

    // Deploy the contract
    console.log('🚀 Deploying contract...');
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(1000000)
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxTransactionFee(new Hbar(1));

    const contractCreateResponse = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateResponse.getReceipt(client);
    const contractId = contractCreateReceipt.contractId!;

    console.log('✅ BatchReviewAttestation deployed successfully!');
    console.log(`📍 Contract ID: ${contractId.toString()}`);
    console.log(`🔗 Hashscan: https://testnet.hashscan.io/contract/${contractId.toString()}`);
    console.log(`💰 Gas used: ${contractCreateReceipt.gasUsed}`);

    // Save deployment info
    const deploymentInfo = {
      contractName: "BatchReviewAttestation",
      contractId: contractId.toString(),
      fileId: fileId.toString(),
      network: "hederaTestnet",
      deployedAt: new Date().toISOString(),
      deployer: process.env.HEDERA_ACCOUNT_ID,
      gasUsed: contractCreateReceipt.gasUsed.toString(),
      transactionId: contractCreateResponse.transactionId.toString()
    };

    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, 'batch-attestation-hedera.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`📝 Deployment info saved to: ${deploymentPath}`);

    // Test the deployed contract
    console.log('🧪 Testing deployed contract...');
    await testDeployedContract(client, contractId);

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env with BATCH_ATTESTATION_CONTRACT_ID=' + contractId.toString());
    console.log('2. Implement BatchAttestationService in backend');
    console.log('3. Update L3 review endpoint to use batch processing');
    console.log('4. Test the optimization with real reviews');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

async function testDeployedContract(client: Client, contractId: any) {
  try {
    console.log('🔍 Testing contract functionality...');

    // Test reading the contract (basic functionality check)
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction('batches', new ContractFunctionParameters().addString('test-batch'));

    try {
      await query.execute(client);
      console.log('✅ Contract is responding to queries');
    } catch (error: any) {
      if (error.message.includes('Review not found') || error.message.includes('Batch not found')) {
        console.log('✅ Contract is responding correctly (expected error for non-existent batch)');
      } else {
        throw error;
      }
    }

    console.log('✅ Contract test completed successfully');

  } catch (error) {
    console.error('❌ Contract test failed:', error);
    throw error;
  }
}

// Run deployment
deployBatchContract()
  .then(() => {
    console.log('🎉 Deployment script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
  });
