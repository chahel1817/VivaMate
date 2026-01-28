const express = require("express");
const router = express.Router();
const {
    getDailyChallenge,
    submitChallenge,
    getChallengeHistory,
    toggleBookmark,
    getBookmarks
} = require("../controllers/challengeController");
const protect = require("../middleware/authMiddleware");

router.get("/daily", protect, getDailyChallenge);
router.post("/submit", protect, submitChallenge);
router.get("/history", protect, getChallengeHistory);
router.get("/bookmarks", protect, getBookmarks);
router.post("/bookmark", protect, toggleBookmark);

module.exports = router;
