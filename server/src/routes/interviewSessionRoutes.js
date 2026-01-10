const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  startSession,
  createSummary,
  getMySummary,
} = require("../controllers/interviewSessionController");

const router = express.Router();

router.post("/start-session", protect, startSession);
router.post("/summary", protect, createSummary);
router.get("/summary", protect, getMySummary);

module.exports = router;
