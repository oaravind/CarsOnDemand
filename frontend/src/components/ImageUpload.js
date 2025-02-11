// src/components/ImageUpload.js

import React, { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import '../index.css';

function ImageUpload({
  onUploadComplete,
  maxNumberOfFiles = 1,
  multiple = false,
  required = false,
  uploadUrl = 'http://localhost:5050/api/images/upload',
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    let files = Array.from(e.target.files);
  
    // Limit the number of files
    if (files.length > maxNumberOfFiles) {
      files = files.slice(0, maxNumberOfFiles);
      alert(`You can upload up to ${maxNumberOfFiles} image(s).`);
    }
  
    // Validate and compress images
    const compressedFilesPromises = files.map(async (file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed.');
        return null;
      }
  
      // Compress the image
      const options = {
        maxSizeMB: 1, // Max size in MB
        maxWidthOrHeight: 800, // Max width or height in pixels
        useWebWorker: true,
      };
  
      try {
        const compressedBlob = await imageCompression(file, options);
  
        // Create a new File object with the compressed Blob
        const compressedFile = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });
  
        return compressedFile;
      } catch (error) {
        console.error('Error compressing image:', error);
        return null;
      }
    });
  
    const compressedFiles = await Promise.all(compressedFilesPromises);
  
    // Remove any null values from the array
    const validFiles = compressedFiles.filter((file) => file !== null);
  
    setSelectedFiles(validFiles);
  
    // Generate preview images
    const previewPromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
  
    const previews = await Promise.all(previewPromises);
    setPreviewImages(previews);
  };
  

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select image(s) to upload.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploading(false);
      alert('Image(s) uploaded successfully.');

      // Callback with uploaded image URLs
      if (onUploadComplete) {
        onUploadComplete(response.data.imageUrls);
      }

      // Reset the component
      setSelectedFiles([]);
      setPreviewImages([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploading(false);
      alert('Failed to upload image(s).');
    }
  };

  return (
    <div>
      <input
      className='form-input'
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        required
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
        {previewImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Preview ${index}`}
            style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
          />
        ))}
      </div>
      <button onClick={handleUpload} disabled={uploading} className='form-input' >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}

export default ImageUpload;
