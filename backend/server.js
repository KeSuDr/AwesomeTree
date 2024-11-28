// // server.js
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const multer = require('multer');
// const EdgeImpulseClassifier = require('../frontend/run-impulse');
// const { convertImageToHex } = require('./node/image-utils');
// const fs = require('fs');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('./uploads')) {
//     fs.mkdirSync('./uploads');
// }

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
// let classifierReady = false;

// // Root route
// app.get('/', (req, res) => {
//     res.json({
//         status: 'online',
//         classifierStatus: classifierReady ? 'ready' : 'initializing',
//         message: 'Edge Impulse Classification Server',
//         endpoints: {
//             root: '/',
//             classify: '/api/classify'
//         }
//     });
// });

// // Classification endpoint
// app.post('/api/classify', upload.single('image'), async (req, res) => {
//     console.log("A")
//     try {
//         if (!classifierReady) {
//             return res.status(503).json({
//                 success: false,
//                 error: 'Classifier is not ready yet'
//             });
//         }

//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'No image file provided'
//             });
//         }

//         console.log('Processing image:', req.file.path);

//         const rawFeatures = await convertImageToHex(req.file.path);
//         console.log('Features extracted, classifying...');

//         const result = classifier.classify(rawFeatures);
//         console.log('Classification result:', result);

//         res.json({
//             success: true,
//             data: {
//                 imagePath: `/uploads/${path.basename(req.file.path)}`,
//                 predictions: result.results.map(r => ({
//                     label: r.label,
//                     confidence: (r.value * 100).toFixed(2) + '%',
//                     rawValue: r.value
//                 })),
//                 timestamp: new Date().toISOString()
//             }
//         });

//     } catch (error) {
//         console.error('Classification error:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

// // Error handling
// app.use((err, req, res, next) => {
//     console.error('Server error:', err);
//     res.status(500).json({
//         success: false,
//         error: 'Internal Server Error',
//         message: err.message
//     });
// });

// const PORT = process.env.PORT || 4001;

// // Initialize classifier before starting server
// console.log('Initializing classifier...');
// classifier.init()
//     .then(() => {
//         console.log('Classifier initialized successfully');
//         classifierReady = true;
        
//         // Start server after classifier is ready
//         app.listen(PORT, () => {
//             console.log(`Server is running on http://localhost:${PORT}`);
//             console.log('Available endpoints:');
//             console.log(`- GET  http://localhost:${PORT}/`);
//             console.log(`- POST http://localhost:${PORT}/api/classify`);
//         });
//     })
//     .catch(err => {
//         console.error('Failed to initialize classifier:', err);
//         process.exit(1);
//     });

// // Handle uncaught errors
// process.on('uncaughtException', (err) => {
//     console.error('Uncaught Exception:', err);
// });

// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled Rejection:', err);
// });