const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // If credentials are not configured, log to console instead of crashing/failing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Warning: Email credentials not configured in server/.env. Skipping email dispatch.');
    console.log(`\n================== MOCK EMAIL NOTIFICATION ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]*>/g, '\n').trim()}`);
    console.log(`=============================================================\n`);
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard Gmail SMTP configuration
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Gmail App Password
      }
    });

    const info = await transporter.sendMail({
      from: `"Export Business Website" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('Email sent successfully: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error occurred while sending email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
