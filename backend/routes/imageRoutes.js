// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadImages } = require('../controllers/imageController');

// Route to handle image upload
router.post('/upload', upload.array('images', 10), uploadImages);

module.exports = router;
