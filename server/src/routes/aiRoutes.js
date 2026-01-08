const express = require('express');
const protect = require('../middleware/authMiddleware');
const { generateQuestion, evaluateAnswer } = require('../controllers/aiController');

const router = express.Router();

// Generate question
router.post('/question', protect, generateQuestion);

// Evaluate answer
router.post('/evaluate', protect, evaluateAnswer);

module.exports = router;
