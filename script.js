import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js';
// import EdgeImpulseClassifier from './AI/run-impulse.js';  // Assuming run-impulse.js is a module
// import base64ToHex from './AI/base64tohex.js';

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


// //MODEL

// // Initialize the classifier
// const classifier = new EdgeImpulseClassifier();

// // Function to classify an image using the model
// async function classifyImageFromFirebase(base64Image) {
//   try {
//     // Step 1: Convert base64 image to hex data
//     const hexData = await base64ToHex(base64Image);
//     console.log('Hex Data:', hexData); // Optionally log the hex data for debugging

//     // Step 2: Initialize the classifier if not already initialized
//     await classifier.init();

//     // Step 3: Convert the hex data into the proper format (assuming it's an array of raw pixel data)
//     const rawData = convertHexToRawData(hexData);  // You may need to adapt this based on how the model expects the input

//     // Step 4: Classify the image using the model
//     const result = classifier.classify(rawData);
//     console.log('Classification Result:', result);

//     // Step 5: Display the results (adjust depending on your UI)
//     displayResults(result);

//   } catch (error) {
//     console.error('Error classifying image:', error);
//   }
// }

// // Helper function to convert hex data to raw pixel data
// function convertHexToRawData(hexData) {
//   const rawData = new Float32Array(hexData.length / 2);
//   for (let i = 0; i < hexData.length; i += 2) {
//     rawData[i / 2] = parseInt(hexData.slice(i, i + 2), 16);
//   }
//   return rawData;
// }

// // Function to display the classification results on your webpage
// function displayResults(result) {
//   // Example of displaying anomaly and classification results
//   console.log('Anomaly:', result.anomaly);
//   result.results.forEach((item) => {
//     console.log(`Label: ${item.label}, Value: ${item.value}`);
//     // You can display the results on your webpage as needed
//     document.getElementById('classificationResult').innerHTML = `Label: ${item.label}, Value: ${item.value}`;
//   });
// }

// const plant1base64Image = data.plant1['esp32-cam1'].img;
// // Example usage: Fetch base64 image from Firebase and classify it
// classifyImageFromFirebase(plant1base64Image);

// //END MODEL


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

// Initialize EmailJS (Make sure to add your user ID if necessary)
emailjs.init('0UZ2mZidZTAGepxNG');

// Function to send email via EmailJS
function sendEmail(subject, message) {
  const templateParams = {
    to_email: 'eurkung@gmail.com',  // Replace with your email
    subject: subject,
    message: message,
  };

  emailjs.send('service_q6j0aro', 'template_l6zejta', templateParams)
    .then(response => {
      console.log('Email sent successfully:', response);
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
}

// Capture button handler

document.getElementById('capture-button').addEventListener('click', () => {
  // Reference to the photo handler in Firebase
  const photoHandlerRef = ref(db, 'ESP32-Gateway1/plant1/esp32-cam1/capture-handler');

  // Update photoHandler value to 1 (indicating photo capture)
  set(photoHandlerRef, 1)
    .then(() => {
      console.log('Photo handler updated to 1.');
      // Optionally, you can take a photo here or trigger your camera function
    })
    .catch((error) => {
      console.error('Error updating photo handler:', error);
    });

  // Fetch the base64 image from Firebase
  const imageRef = ref(db, 'ESP32-Gateway1/plant1/esp32-cam1/img');
  onValue(imageRef, (snapshot) => {
    const base64Image = snapshot.val(); // This should be the base64 image data

    if (base64Image) {
      // Call the classifyImage function to send the image for classification
      classifyImage(base64Image);
    } else {
      console.log('No image data available');
    }
  });
});

// Function to send the base64 image to the server for classification
async function classifyImage(base64Image) {
  try {
    // Make a POST request to the server with the base64 image
    const response = await fetch('/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }), // Send base64 image as JSON
    });

    if (!response.ok) {
      throw new Error('Error classifying image');
    }

    // Get the classification result
    const result = await response.json();

    // Display the classification result on the webpage
    displayResults(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to display the classification results on the webpage
function displayResults(result) {
  console.log('Classification Result:', result);
  
  // Update the result display element (or create a new element in your HTML)
  const classificationResultElement = document.getElementById('classificationResult');
  if (classificationResultElement) {
    classificationResultElement.innerHTML = `
      <pre>${JSON.stringify(result, null, 2)}</pre>
    `;
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
    const image1Timestamp = parseInt(data.plant1['esp32-cam1'].timestamp);
    const plant1base64Image = data.plant1['esp32-cam1'].img;
    document.getElementById('light1').textContent = formatValue(data.plant1.light) + ' lx';
    document.getElementById('soilMoisture1').textContent = formatValue(data.plant1.soil_moisture) + '%';
    document.getElementById('pumpState1').textContent = data.plant1.pump ? "On" : "Off";
    document.getElementById('timeStamp1').textContent = formatTimestamp(plant1Timestamp);

    document.getElementById('plant1-image').src = `data:image/jpeg;base64,${plant1base64Image}`;
    document.getElementById('image1timeStamp').textContent = formatTimestamp(image1Timestamp);
    // Update plant2 data
    const plant2Timestamp = parseInt(data.plant2.timestamp);
    document.getElementById('light2').textContent = formatValue(data.plant2.light) + ' lx';
    document.getElementById('soilMoisture2').textContent = formatValue(data.plant2.soil_moisture) + '%';
    document.getElementById('pumpState2').textContent = data.plant2.pump ? "On" : "Off";
    document.getElementById('timeStamp2').textContent = formatTimestamp(plant2Timestamp);

    // Check for conditions and send email if required
    // if (data.plant1.soil_moisture < 30) {  // Example condition: Soil moisture below 30%
    //   sendEmail('Plant1 Soil Moisture Alert', 'Soil moisture is too low for Plant1.');
    // }

    if (data.temperature > 50) {  // Example condition: Temperature exceeds 30°C
      sendEmail('Temperature Alert', `Temperature is too high: ${data.temperature}°C`);
    }

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

// async function classifyImage(base64Image) {
//   try {
//     const response = await fetch('/classify', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ base64Image }),
//     });

//     if (!response.ok) {
//       throw new Error('Error classifying image');
//     }

//     const result = await response.json();
//     displayResults(result); // Display result on the webpage
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// Display classification results
// function displayResults(result) {
//   console.log('Classification Result:', result);
//   document.getElementById('classificationResult').innerHTML = JSON.stringify(result, null, 2);
// }

// Example usage
// const plant1base64Image = data.plant1['esp32-cam1'].img;
// classifyImage(plant1base64Image); // Send base64 image to server for classification
