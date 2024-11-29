const sharp = require('sharp');

// Function to convert base64 to hex after resizing to 96x96
async function base64ToHex(base64String) {
    // Decode the base64 string into a buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Resize the image to 96x96 using sharp
    const resizedBuffer = await sharp(buffer)
        .resize(96, 96)  // Resize the image to 96x96
        .greyscale()     // Convert the image to grayscale
        .raw()           // Get the raw pixel data
        .toBuffer();

    // Convert the resized buffer to hex
    const hexArray = [];
    for (let i = 0; i < resizedBuffer.length; i++) {
        const hex = resizedBuffer[i].toString(16).padStart(2, '0'); // Convert each byte to hex
        hexArray.push(hex);
    }

    // Join the hex values into a single string (optional, can return as an array if preferred)
    return hexArray.join('');
}

module.exports = base64ToHex;

// Example usage
// const base64Image = 'your_base64_image_string_here'; // Replace with your Base64 image string
// base64ToHex(base64Image).then(hexData => {
//     console.log(hexData);  // The hex representation of the resized Base64 image
// }).catch(err => {
//     console.error('Error:', err);
// });
