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
const memoryUpload = multer({ storage: memoryStorage });
const resumeController = require("../controllers/resumeController");

router.post("/resume", protect, memoryUpload.single("resume"), resumeController.parseResume);

module.exports = router;
