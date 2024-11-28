// // image-utils.js
// const sharp = require('sharp');

// async function convertImageToHex(imagePath) {
//     const imageBuffer = await sharp(imagePath)
//         .resize(96, 96)
//         .greyscale()
//         .raw()
//         .toBuffer();

//     let hexFeatures = [];

//     for (let i = 0; i < imageBuffer.length; i++) {
//         let pixelValue = imageBuffer[i];
//         let hexValue = pixelValue.toString(16).padStart(2, '0');
//         hexFeatures.push(`0x${hexValue}${hexValue}${hexValue}`);
//     }

//     return hexFeatures;
// }

// module.exports = {
//     convertImageToHex
// };