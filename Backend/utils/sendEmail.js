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

  // Check if Gmail credentials are provided
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    // Use Gmail SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular Gmail password
      }
    });
    
    console.log('Using Gmail SMTP for sending emails');
  }
  // Check if other SMTP credentials are provided
  else if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
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
    
    console.log('Using custom SMTP for sending emails');
  } 
  else {
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
    console.log(`Test email: ${testAccount.user}`);
  }

  // Use the appropriate sender email
  const senderEmail = process.env.GMAIL_EMAIL || 
                      process.env.SMTP_EMAIL || 
                      (testAccount ? testAccount.user : 'noreply@excelanalytics.com');

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Excel Analytics'} <${senderEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  
  // If using test account, log the preview URL
  if (testAccount) {
    console.log('Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return {
      ...info,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  }
  
  return info;
};

module.exports = sendEmail; 