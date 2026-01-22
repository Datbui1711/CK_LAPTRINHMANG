const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Validate Cloudinary configuration
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.warn('⚠️  Cloudinary configuration missing! Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file');
} else {
  cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret
  });
  console.log('✅ Cloudinary configured successfully');
}

module.exports = cloudinary;

