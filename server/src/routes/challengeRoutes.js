const express = require("express");
const router = express.Router();
const {
    getDailyChallenge,
    submitChallenge,
    getChallengeHistory,
    getUnifiedHistory,
    toggleBookmark,
    getBookmarks
} = require("../controllers/challengeController");
const protect = require("../middleware/authMiddleware");

// Validation
const validate = require("../middleware/validate");
const { submitChallengeSchema } = require("../schemas/challengeSchemas");

router.get("/daily", protect, getDailyChallenge);
router.post("/submit", protect, validate(submitChallengeSchema), submitChallenge);
router.get("/history", protect, getChallengeHistory);
router.get("/history/unified", protect, getUnifiedHistory);
router.get("/bookmarks", protect, getBookmarks);
router.post("/bookmark", protect, toggleBookmark);

module.exports = router;
