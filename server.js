const express = require('express'); // Node.js web server framework
const bodyParser = require('body-parser'); // Parse JSON data
const cors = require('cors'); // Enable CORS
const { getDatabase, ref, onValue } = require('firebase/database');
const { initializeApp } = require('firebase/app');
const EdgeImpulseClassifier = require('./AI/run-impulse.js');  // Server-side model
const fs = require('fs'); // File system module
const { base64ToRawFeatures, normalizeToHex } = require('./AI/base64tohex.js'); // Convert base64 to raw features

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const server = express();

// Enable CORS for all requests
server.use(cors());
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

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
