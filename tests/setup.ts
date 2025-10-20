// Test setup - set environment variables before any imports
process.env.JWT_SECRET = 'test-secret';
process.env.HCS_TOPIC_ID = '0.0.123456';
process.env.REVIEW_ATTESTATION_ADDRESS = '0xf1f0689e3a9ac73af634e8661d16e8f7de332a60';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';