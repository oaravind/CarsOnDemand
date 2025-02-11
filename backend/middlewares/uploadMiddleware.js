// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Multer storage configuration (store files in memory)
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Log the incoming file for debugging
  console.log('Received file:', file);

  // Allowed MIME types and extensions
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedExts = ['.jpeg', '.jpg', '.png', '.gif'];

  // Get the file's MIME type and extension
  const mimeType = file.mimetype;
  const extName = path.extname(file.originalname).toLowerCase();

  // Log the values for debugging
  console.log('File MIME type:', mimeType);
  console.log('File extension:', extName);

  // Check if the MIME type and extension are allowed
  if (allowedMimes.includes(mimeType) && allowedExts.includes(extName)) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed'));
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;
