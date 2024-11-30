
const sharp = require('sharp');

// ฟังก์ชันแปลง base64 เป็น raw features
async function base64ToRawFeatures(base64Data) {
    // แปลง base64 เป็น Buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ใช้ sharp เพื่อแปลง buffer เป็น grayscale และ resize เป็น 96x96
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize(96, 96)    // ปรับขนาดเป็น 96x96
        .greyscale()       // แปลงเป็น grayscale
        .raw()             // เอาข้อมูลพิกเซลดิบ
        .toBuffer();

    // แปลงพิกเซลจาก buffer เป็น array และ normalize (0-255 => 0.0-1.0)
    const rawFeatures = Array.from(resizedImageBuffer).map(value => value / 255.0);

    return rawFeatures; // ส่ง raw features กลับ
}

function normalizeToHex(rawFeatures) {

    
    let hexFeatures = [];

    for (let i = 0; i < rawFeatures.length; i++) {
        // แปลง normalized (0.0 - 1.0) เป็น 0 - 255
        let pixelValue = Math.round(rawFeatures[i] * 255);

        // แปลงค่าเป็น hexadecimal และเติม 0 ด้านหน้าให้เป็น 2 หลัก
        let hexValue = pixelValue.toString(16).padStart(2, '0'); // เช่น '1f'

        // สร้างค่า 0xRRGGBB โดยใช้ค่าสีเดียวกันสำหรับ RGB
        hexFeatures.push(`0x${hexValue}${hexValue}${hexValue}`);
    }

    return hexFeatures;
}

// ตัวอย่าง base64 string (ต้องเป็น base64 ของภาพจริง)
const base64Data ='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'
const base64WithoutHeader = base64Data.replace(/^data:image\/png;base64,/, ''); 
const imageBuffer = Buffer.from(base64WithoutHeader, 'base64');


// ใช้ฟังก์ชันเพื่อแปลงและแสดงผล
// base64ToRawFeatures(base64Data)
//     .then(rawFeatures => {
//         console.log('Raw Features Length:', rawFeatures.length); // ควรได้ 9216
//         console.log('Raw Features:', rawFeatures); // แสดง raw features
//         const hexFeatures = normalizeToHex(rawFeatures);
//         console.log('Hex Features:', hexFeatures);
//     })
//     .catch(err => {
//         console.error('Error:', err);
//     });

    
    
    
    // แปลงและแสดงผล
module.exports = {base64ToRawFeatures, normalizeToHex};