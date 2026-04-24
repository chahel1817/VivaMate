const express = require("express");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/video", protect, upload.single("video"), (req, res) => {
  // Cloudinary automatically provides the full secure URL in req.file.path
  res.json({
    videoUrl: req.file.path,
  });
});

router.post("/image", protect, upload.single("image"), (req, res) => {
  // Cloudinary automatically provides the full secure URL in req.file.path
  res.json({
    imageUrl: req.file.path,
  });
});

const multer = require("multer");
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word (.docx/.doc) files are allowed'), false);
    }
  }
});
const resumeController = require("../controllers/resumeController");

router.post("/resume", protect, aiLimiter, memoryUpload.single("resume"), resumeController.parseResume);
router.post("/resume/analyze", protect, aiLimiter, memoryUpload.single("resume"), resumeController.analyzeResume);

module.exports = router;
