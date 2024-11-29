const express = require('express'); // Node.js web server framework
const bodyParser = require('body-parser'); // Parse JSON data
const { getDatabase, ref, onValue } = require('firebase/database');
const { initializeApp } = require('firebase/app');
const EdgeImpulseClassifier = require('./AI/run-impulse.js');  // Server-side model
const fs = require('fs'); // File system modulec
const {base64ToRawFeatures, normalizeToHex} = require('./AI/base64tohex.js'); // Convert base64 to raw features

const base64ToHex = require('./AI/base64tohex.js'); // Convert base64 to hex
//console.log(EdgeImpulseClassifier);
// Initialize Firebase
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
server.use(bodyParser.json()); // For parsing application/json

// API to classify image
server.post('/classify', async (req, res) => {
  const base64Image = req.body.base64Image; // Receive base64 image from client

  try {
    // Step 1: Convert base64 to hex
    //const hexData = await base64ToHex(base64Image);
    //console.log(hexData);

    // Step 2: Initialize and classify
    const classifier = new EdgeImpulseClassifier();
    await classifier.init();

    // Step 3: Convert hex to raw data (adapt this step based on your model)
    //const rawData = convertHexToRawData(hexData);

    // Step 4: Classify the image
    const data = await fs.promises.readFile("message (3).txt", 'utf-8');
    //console.log(data);
   // console.log(hexData);
    const rawData2 = await (data);
    let hexFeatures;
    base64ToRawFeatures(base64Image)
    .then(rawFeatures => {
        const hexFeatures = normalizeToHex(rawFeatures);
        console.log('Hex Features:', hexFeatures);
        const numericFeatures = hexFeatures.map(hex => parseInt(hex, 16)); // แปลง hex เป็นตัวเลข

        try {
            // เรียกใช้งาน classifier และเก็บผลลัพธ์
            const result = classifier.classify(numericFeatures);
            console.log('Inference Result:', result);
            res.json(result);
        } catch (err) {
            console.error('garderers', err);
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
    // console.log('Hex Features:', hexFeatures);
    // const result = await classifier.classify(hexFeatures.trim().split(',').map(n => Number(n)));
    // console.log(result);

    // Send the classification result back to client
    
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).send('Error classifying image');
  }
});

// Convert hex to raw data
function convertHexToRawData(hexData) {
  const rawData = new Float32Array(hexData.length / 2);
  for (let i = 0; i < hexData.length; i += 2) {
    rawData[i / 2] = parseInt(hexData.slice(i, i + 2), 16);
  }
  //console.log(rawData);
  return rawData;
}

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
