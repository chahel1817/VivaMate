const multer = require("multer");
const { storage } = require("../config/cloudinary");

// Use the Cloudinary storage we just configured
const upload = multer({ storage });

module.exports = upload;
