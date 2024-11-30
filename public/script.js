// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to navigate to the Google Spreadsheet in a new tab
export function navigateToSpreadsheet() {
  window.open('https://docs.google.com/spreadsheets/d/1jfHSwQGUyn4sXa_z6zUbHqK9EECjCONMs2NGPVQHKUU/edit?gid=0#gid=0', '_blank');
}

// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Attach click event listeners to each card that needs to navigate
  document.getElementById('esp-card').addEventListener('click', navigateToSpreadsheet);
  document.getElementById('plant1-card').addEventListener('click', navigateToSpreadsheet);
  document.getElementById('plant2-card').addEventListener('click', navigateToSpreadsheet);
});

// Format sensor values with a specified number of decimal places
function formatValue(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

// Convert timestamp to a readable date and time
function formatTimestamp(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
}

// Update online/offline status indicator based on timestamp
function updateOnlineIndicator(cardId, timestamp) {
  const indicator = document.querySelector(`#${cardId} .online-indicator`);
  const currentTime = Date.now(); 
  const threeMinutesAgo = currentTime - 3 * 60 * 1000; 

  if (timestamp < threeMinutesAgo) {
    indicator.style.backgroundColor = "#7f8c8d"; // Gray for offline
  } else {
    indicator.style.backgroundColor = "#1eb163"; // Green for online
  }
}

// Send email using the server (nodemailer)
function sendEmailToServer(subject, message) {
  fetch('http://127.0.0.1:3000/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: subject,
      temperature: message
    })
  })
    .then(response => response.json())  // Expect a JSON response
    .then(data => {
      console.log(data.message);  // Handle success response
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
  
}

// Handle image capture button click
document.getElementById('capture-button').addEventListener('click', () => {
  const photoHandlerRef = ref(db, 'ESP32-Gateway1/plant1/esp32-cam1/capture-handler');

  set(photoHandlerRef, 1)
    .then(() => {
      console.log('Photo handler updated to 1.');
    })
    .catch(error => {
      console.error('Error updating photo handler:', error);
    });

  // Fetch the base64 image from Firebase
  const imageRef = ref(db, 'ESP32-Gateway1/plant1/esp32-cam1/img');
  onValue(imageRef, (snapshot) => {
    const base64Image = snapshot.val();
    if (base64Image) {
      classifyImage(base64Image);
    } else {
      console.log('No image data available');
    }
  });
});

// Send base64 image to the server for classification
async function classifyImage(base64Image) {
  try {
    const response = await fetch('http://127.0.0.1:3000/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      throw new Error('Error classifying image');
    }

    const result = await response.json();
    displayResults(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Display classification results on the webpage
function displayResults(result) {
  const classificationResultElement = document.getElementById('classificationResult');

  if (classificationResultElement) {
    // Check if any classification result has a label 'tree' with a confidence value > 0.9
    const treeFound = result.results.some(item => item.label.toLowerCase() === 'tree');

    // Display "TREE FOUND" or "TREE NOT FOUND" based on the result
    classificationResultElement.textContent = treeFound ? 'Healthy Tree' : 'TREE NOT FOUND';
  }
}

// Fetch and display data from Firebase in real time
const espRef = ref(db, 'ESP32-Gateway1');
onValue(espRef, (snapshot) => {
  try {
    const data = snapshot.val();
    if (!data) {
      console.error("No data available for 'ESP32-Gateway1'");
      return;
    }

    // Update sensor data on the page
    document.getElementById('humidity').textContent = formatValue(data.humidity) + '%';
    document.getElementById('temperature').textContent = formatValue(data.temperature) + '°C';
    document.getElementById('timeStamp').textContent = formatTimestamp(data.timestamp);

    // Update plant 1 data
    document.getElementById('light1').textContent = formatValue(data.plant1.light) + ' lx';
    document.getElementById('soilMoisture1').textContent = formatValue(data.plant1.soil_moisture) + '%';
    document.getElementById('pumpState1').textContent = data.plant1.pump ? "On" : "Off";
    document.getElementById('timeStamp1').textContent = formatTimestamp(data.plant1.timestamp);
    document.getElementById('image1timeStamp').textContent = formatTimestamp(data.plant1['esp32-cam1'].timestamp);
    document.getElementById('plant1-image').src = `data:image/jpeg;base64,${data.plant1['esp32-cam1'].img}`;

    // Update plant 2 data
    document.getElementById('light2').textContent = formatValue(data.plant2.light) + ' lx';
    document.getElementById('soilMoisture2').textContent = formatValue(data.plant2.soil_moisture) + '%';
    document.getElementById('pumpState2').textContent = data.plant2.pump ? "On" : "Off";
    document.getElementById('timeStamp2').textContent = formatTimestamp(data.plant2.timestamp);

    // Check conditions and send alerts
    if (!true) {
      sendEmailToServer('Temperature Alert', `Temperature is too high: ${data.temperature}°C`);
    }

    // Update online indicators
    updateOnlineIndicator('esp-card', data.timestamp);
    updateOnlineIndicator('plant1-card', data.plant1.timestamp);
    updateOnlineIndicator('image-card', data.plant1['esp32-cam1'].stillAlive);
    updateOnlineIndicator('plant2-card', data.plant2.timestamp);

    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';

  } catch (error) {
    console.error("Error updating data:", error);
  }
});
