const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDatabase, ref, onValue } = require("firebase/database");
const { initializeApp } = require("firebase/app");
const path = require("path");

const EdgeImpulseClassifier = require("./AI/run-impulse.js"); // AI model
const { base64ToRawFeatures, normalizeToHex } = require("./AI/base64tohex.js"); // Convert base64 to hex

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  databaseURL: "YOUR_FIREBASE_DB_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const server = express();
server.use(cors());
server.use(bodyParser.json());

// Serve static files (index.html, scripts, and styles)
server.use(express.static(path.join(__dirname)));

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API to classify image
server.post("/classify", async (req, res) => {
  const base64Image = req.body.base64Image;

  try {
    const classifier = new EdgeImpulseClassifier();
    await classifier.init();

    base64ToRawFeatures(base64Image)
      .then((rawFeatures) => {
        const hexFeatures = normalizeToHex(rawFeatures);
        const numericFeatures = hexFeatures.map((hex) => parseInt(hex, 16));

        try {
          const result = classifier.classify(numericFeatures);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: "Classification error" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Error processing image" });
      });
  } catch (error) {
    res.status(500).json({ error: "Error classifying image" });
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
