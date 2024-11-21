import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js';

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

// Function to format sensor values
function formatValue(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

// Function to convert timestamp to readable date and time
function formatTimestamp(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
}

// Function to update online indicator
function updateOnlineIndicator(cardId, timestamp) {
  const indicator = document.querySelector(`#${cardId} .online-indicator`);
  const currentTime = Date.now(); // Current time in milliseconds
  const threeMinutesAgo = currentTime - 3 * 60 * 1000; // 3 minutes ago

  console.log(`Current Time: ${currentTime}, Timestamp: ${timestamp}, Three Minutes Ago: ${threeMinutesAgo}`);

  if (timestamp < threeMinutesAgo) {
    indicator.style.backgroundColor = "#7f8c8d"; // Gray for offline
    console.log(`${cardId} is offline`);
  } else {
    indicator.style.backgroundColor = "#1eb163"; // Green for online
    console.log(`${cardId} is online`);
  }
}


// Reference to ESP32-Gateway1 data and listen for changes
const espRef = ref(db, 'ESP32-Gateway1');
onValue(espRef, (snapshot) => {
  try {
    const data = snapshot.val();
    if (!data) {
      console.error("No data available for 'ESP32-Gateway1'");
      return;
    }

    console.log("Fetched data:", data); // Debugging: log the data

    // Update the data on the page
    const espTimestamp = parseInt(data.timestamp);
    document.getElementById('humidity').textContent = formatValue(data.humidity) + '%';
    document.getElementById('temperature').textContent = formatValue(data.temperature) + '°C';
    document.getElementById('timeStamp').textContent = formatTimestamp(espTimestamp);

    // Update plant1 data
    const plant1Timestamp = parseInt(data.plant1.timestamp);
    document.getElementById('light1').textContent = formatValue(data.plant1.light) + ' lx';
    document.getElementById('soilMoisture1').textContent = formatValue(data.plant1.soil_moisture) + '%';
    document.getElementById('pumpState1').textContent = data.plant1.pump ? "On" : "Off";
    document.getElementById('timeStamp1').textContent = formatTimestamp(plant1Timestamp);

    // Update plant2 data
    const plant2Timestamp = parseInt(data.plant2.timestamp);
    document.getElementById('light2').textContent = formatValue(data.plant2.light) + ' lx';
    document.getElementById('soilMoisture2').textContent = formatValue(data.plant2.soil_moisture) + '%';
    document.getElementById('pumpState2').textContent = data.plant2.pump ? "On" : "Off";
    document.getElementById('timeStamp2').textContent = formatTimestamp(plant2Timestamp);

    // Update online indicators
    updateOnlineIndicator('esp-card', espTimestamp);
    updateOnlineIndicator('plant1-card', plant1Timestamp);
    updateOnlineIndicator('plant2-card', plant2Timestamp);

    // Hide the loading screen after data is fetched
    document.getElementById('loading-screen').style.display = 'none';

  } catch (error) {
    console.error("Error updating data:", error); // Debugging: log errors
  }
});
