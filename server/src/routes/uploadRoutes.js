const express = require("express");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/video", protect, upload.single("video"), (req, res) => {
  res.json({
    videoUrl: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
