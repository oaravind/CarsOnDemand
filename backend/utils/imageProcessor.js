// utils/imageProcessor.js
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads' directory exists
const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

async function processAndSaveImage(buffer) {
  // Compress and resize the image using sharp
  const compressedImage = await sharp(buffer)
    .resize({ width: 800 }) // Resize the image to a width of 800px
    .jpeg({ quality: 70 }) // Compress the image
    .toBuffer();

  // Generate a unique filename
  const filename = `${uuidv4()}.jpeg`;

  // Save the image to the uploads folder
  const filePath = path.join(uploadPath, filename);
  fs.writeFileSync(filePath, compressedImage);

  return filename;
}

module.exports = { processAndSaveImage };
