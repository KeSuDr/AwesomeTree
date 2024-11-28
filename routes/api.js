// // routes/api.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const EdgeImpulseClassifier = require('../run-impulse');
// const { convertImageToHex } = require('../image-utils');

// // Configure multer for file upload
// const storage = multer.diskStorage({
//     destination: './uploads/',
//     filename: function(req, file, cb) {
//         cb(null, 'image-' + Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // Initialize classifier
// const classifier = new EdgeImpulseClassifier();
// classifier.init();

// // GET - Check if model is ready
// router.get('/status', (req, res) => {
//     try {
//         const projectInfo = classifier.getProjectInfo();
//         res.json({
//             status: 'online',
//             model: projectInfo,
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         res.status(503).json({
//             status: 'offline',
//             error: error.message
//         });
//     }
// });

// // POST - Classify an image
// router.post('/classify', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ 
//                 success: false, 
//                 error: 'No image file provided' 
//             });
//         }

//         const rawFeatures = await convertImageToHex(req.file.path);
//         const result = classifier.classify(rawFeatures);

//         res.json({
//             success: true,
//             data: {
//                 imagePath: `/uploads/${path.basename(req.file.path)}`,
//                 predictions: result.results.map(r => ({
//                     label: r.label,
//                     confidence: (r.value * 100).toFixed(2) + '%',
//                     rawValue: r.value
//                 })),
//                 anomaly: result.anomaly,
//                 timestamp: new Date().toISOString()
//             }
//         });

//     } catch (error) {
//         console.error('Classification error:', error);
//         res.status(500).json({ 
//             success: false,
//             error: error.message,
//             details: 'Classification failed'
//         });
//     }
// });

// // GET - List all classifications (if you're storing them)
// router.get('/classifications', (req, res) => {
//     // Add your logic to retrieve classification history
//     res.json({
//         message: 'Classification history endpoint'
//         // Add your classification history data here
//     });
// });

// module.exports = router;