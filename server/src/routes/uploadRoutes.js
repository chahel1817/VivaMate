const express = require("express");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/video", protect, upload.single("video"), (req, res) => {
  res.json({
    videoUrl: `/uploads/${req.file.filename}`,
  });
});

router.post("/image", protect, upload.single("image"), (req, res) => {
  res.json({
    imageUrl: `/uploads/${req.file.filename}`,
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

router.post("/resume", protect, memoryUpload.single("resume"), resumeController.parseResume);
router.post("/resume/analyze", protect, memoryUpload.single("resume"), resumeController.analyzeResume);

module.exports = router;
