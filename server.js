const express = require('express'); // Node.js web server framework
const bodyParser = require('body-parser'); // Parse JSON data
const cors = require('cors'); // Enable CORS
const { getDatabase, ref, onValue } = require('firebase/database');
const { initializeApp } = require('firebase/app');
const EdgeImpulseClassifier = require('./public/AI/run-impulse.js');  // Server-side model
const fs = require('fs'); // File system module
const { base64ToRawFeatures, normalizeToHex } = require('./public/AI/base64tohex.js'); // Convert base64 to raw features

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm0lVR4SRAn2Roj2cixoVWpt3jjmBiLRY",
  authDomain: "awesomeplantwateringdb.firebaseapp.com",
  databaseURL: "https://awesomeplantwateringdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "awesomeplantwateringdb",
  storageBucket: "awesomeplantwateringdb.firebasestorage.app",
  messagingSenderId: "846024263616",
  appId: "1:846024263616:web:21bcd9b9a9b88a38c9aa25",
  measurementId: "G-6Y3X3HPEQD"
};
const corsConfig = {
  origin: "*",
  credential: true,
  methods : ["GET,HEAD,PUT,PATCH,POST,DELETE"],
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const server = express();

// Enable CORS for all requests
server.use(cors(corsConfig));
server.use(bodyParser.json()); // For parsing application/json

// API to classify image
server.post('/classify', async (req, res) => {
  const base64Image = req.body.base64Image; // Receive base64 image from client

  try {
    const classifier = new EdgeImpulseClassifier();
    await classifier.init();

    base64ToRawFeatures(base64Image)
      .then(rawFeatures => {
        const hexFeatures = normalizeToHex(rawFeatures);
        console.log('Hex Features:', hexFeatures);
        const numericFeatures = hexFeatures.map(hex => parseInt(hex, 16)); // Convert hex to numeric features

        try {
          const result = classifier.classify(numericFeatures);
          console.log('Inference Result:', result);
          res.json(result);
        } catch (err) {
          console.error('Error during classification:', err);
          res.status(500).json({ error: 'Classification error' });
        }
      })
      .catch(err => {
        console.error('Error converting base64 image to raw features:', err);
        res.status(500).json({ error: 'Error processing image' });
      });
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).json({ error: 'Error classifying image' });
  }
});

const nodemailer = require('nodemailer');

server.post('/send-email', (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'treeawesome888@gmail.com',
      pass: 'gffe lkft groq iwme'  // Use your app password here
    }
  });

  const options = {
    from: 'treeawesome888@gmail.com',
    to: 'eurkung@gmail.com',
    subject: req.body.subject,
    text: `Hello,

You got a new message from: awesomeTreeEmbeddedProject

${req.body.temperature}

Best wishes,
awesomeTree888 team`
  };

  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log('Error:', error);
      return res.status(500).json({ error: 'Error sending email' });  // Return error as JSON
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });  // Return success as JSON
  });
});







// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
