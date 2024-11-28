const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Set up Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'treeawesome888@gmail.com',  // Your Gmail address
    pass: 'awesometree',   // Your Gmail password or app-specific password (if 2FA is enabled)
  },
});

// Cloud Function to send email based on data changes
exports.sendEmailOnDataChange = functions.database.ref('/ESP32-Gateway1')
  .onUpdate((change, context) => {
    // Get the new value from the Realtime Database
    const newValue = change.after.val();
    
    // Check if the moisture level is low (example condition)
    if (newValue.plant1.soil_moisture < 30) {
      const mailOptions = {
        from: 'treeawesome888@gmail.com',
        to: 'eurkung@gmail.com',
        subject: 'Soil Moisture Alert',
        text: `Alert: The soil moisture level of Plant 1 is low. Current level: ${newValue.plant1.soil_moisture}%`,
      };

      // Send the email
      return transporter.sendMail(mailOptions)
        .then(() => {
          console.log('Email sent successfully');
        })
        .catch((error) => {
          console.error('Error sending email:', error);
        });
    }
    return null;
  });
