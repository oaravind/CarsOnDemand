// controllers/imageController.js
const { processAndSaveImage } = require('../utils/imageProcessor');

const uploadImages = async (req, res) => {
  try {
    const files = req.files;
    const imageUrls = [];

    for (const file of files) {
      const filename = await processAndSaveImage(file.buffer);

      // Generate the image URL
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      imageUrls.push(imageUrl);
    }

    res.json({ imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadImages };
