const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. Configure Cloudinary with your credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "vivamate", // This creates a folder named 'vivamate' in your Cloudinary media library
        allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx"], // Only these files will be accepted
        resource_type: "auto", // Automatically detects if it's an image, video, or raw file (PDF)
    },
});

module.exports = { cloudinary, storage };
