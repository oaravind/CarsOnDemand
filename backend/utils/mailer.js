require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // Use environment variables
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email.
 * @param {string} to - Receiver's email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email body (plain text).
 */

function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,      // Sender address
    to: to,                            // List of receivers
    subject: 'Welcome to our platform',                  // Subject line
    //text: `Welcome to our platform, ${name}!`,                        // Plain text body
    html: `
    <body style="color: white; bgcolor: black;">
    <h1>Welcome to our platform, ${name}!</h1>
    <p>Good to see you onboard with us. We hope you like this platform.</p>
    
    Best Regards,<br>
    <b>COD - Cars on Demand!<b>
    </body>`, // Uncomment to send HTML emails
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // Handle error appropriately
    } else {
      console.log('Email sent:', info.response);
      // Handle success appropriately
    }
  }
  );
}
function sendSettlementEmail(to, settlementLink) {
  const mailOptions = {
    from: process.env.EMAIL_USER,      // Sender address
    to: to,                            // List of receivers
    subject: 'Settlement Link',                  // Subject line
    //text: `Welcome to our platform, ${name}!`,                        // Plain text body
    html: `
    <body>
    <h1>Settlement Link</h1>
    <p>Click the link below to settle the rental:</p>
    <a href="${settlementLink}">Settle Rental</a>
    
    Best Regards,<br>
    <b>COD - Cars on Demand!<b>
    </body>`, // Uncomment to send HTML emails
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // Handle error appropriately
    } else {
      console.log('Email sent:', info.response);
      // Handle success appropriately
    }
  }
  );
}

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,      // Sender address
    to: to,                            // List of receivers
    subject: subject,                  // Subject line
    text: text,                        // Plain text body
    // html: '<p>Your HTML content here</p>', // Uncomment to send HTML emails
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // Handle error appropriately
    } else {
      console.log('Email sent:', info.response);
      // Handle success appropriately
    }
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendSettlementEmail};
