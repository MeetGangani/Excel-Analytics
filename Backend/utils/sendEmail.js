const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (HTML supported)
 */
const sendEmail = async (options) => {
  let transporter;
  let testAccount;

  // Check if SMTP credentials are provided
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    // Create a test account if no credentials are provided
    testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('Using Ethereal test account for email:');
    console.log(`SMTP_EMAIL=${testAccount.user}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(testAccount)}`);
  } else {
    // Use provided SMTP credentials
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Excel Analytics'} <${
      process.env.FROM_EMAIL || (testAccount ? testAccount.user : process.env.SMTP_EMAIL)
    }>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  
  // If using test account, log the preview URL
  if (testAccount) {
    console.log('Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = sendEmail; 