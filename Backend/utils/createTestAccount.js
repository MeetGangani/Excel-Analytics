const nodemailer = require('nodemailer');

/**
 * Create a test SMTP account using Ethereal email
 * Run this script with: node utils/createTestAccount.js
 */
async function createTestAccount() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('Test SMTP Account Created:');
    console.log('=========================');
    console.log(`SMTP_HOST=${testAccount.smtp.host}`);
    console.log(`SMTP_PORT=${testAccount.smtp.port}`);
    console.log(`SMTP_SECURE=${testAccount.smtp.secure}`);
    console.log(`SMTP_EMAIL=${testAccount.user}`);
    console.log(`SMTP_PASSWORD=${testAccount.pass}`);
    console.log('\nAdd these to your .env file for testing purposes.');
    console.log('\nView sent emails at: https://ethereal.email');
  } catch (error) {
    console.error('Error creating test account:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTestAccount();
}

module.exports = createTestAccount; 