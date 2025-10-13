
import { IPFSService } from './services/storage/ipfs.service.ts';

async function testIPFS() {
  try {
    console.log('Testing IPFS upload...\n');

    const testData = {
      message: 'Hello from Aphasia!',
      timestamp: new Date().toISOString(),
      test: true,
    };

    console.log('Uploading JSON:', testData);
    const ipfsHash = await IPFSService.uploadJSON(testData);

    console.log('\n✅ Upload successful!');
    console.log('IPFS Hash:', ipfsHash);
    console.log('Gateway URL:', IPFSService.getGatewayUrl(ipfsHash));

    console.log('\nRetrieving content...');
    const content = await IPFSService.getContent(ipfsHash);
    
    console.log('✅ Content retrieved:');
    console.log(JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testIPFS();
