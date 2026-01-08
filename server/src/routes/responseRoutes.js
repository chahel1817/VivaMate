const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  saveResponse,
  getMyResponses,
} = require("../controllers/responseController");

router.post("/", protect, saveResponse);
router.get("/", protect, getMyResponses); // 👈 NEW

module.exports = router;
