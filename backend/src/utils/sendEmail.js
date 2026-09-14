// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Create the transporter using Gmail's SMTP server
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `"Society Tracker Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = sendEmail;