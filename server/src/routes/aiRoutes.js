const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// GET /api/ai/health (diagnostic endpoint)
router.get('/health', aiController.health);

// POST /api/ai/generate
// body: { type, count, sessionId, userId, maxAttempts }
router.post('/generate', async (req, res, next) => {
	try {
		const { type, count, sessionId, userId, maxAttempts } = req.body || {};
		const questions = await aiController.generateUniqueQuestions({
			type: type || 'general',
			count: Number(count) || 5,
			sessionId: sessionId || null,
			userId: userId || null,
			maxAttempts: Number(maxAttempts) || 4
		});
		console.info(`Generated ${questions.length} questions of type "${type}"`);
		return res.status(200).json({ questions, success: true });
	} catch (err) {
		console.error('generate route error:', err);
		return res.status(500).json({ success: false, message: 'Failed to generate questions', error: err.message });
	}
});

// POST /api/ai/question (compatibility alias for /generate)
router.post('/question', async (req, res, next) => {
	try {
		const { type, count, sessionId, userId, maxAttempts } = req.body || {};
		const questions = await aiController.generateUniqueQuestions({
			type: type || 'general',
			count: Number(count) || 5,
			sessionId: sessionId || null,
			userId: userId || null,
			maxAttempts: Number(maxAttempts) || 4
		});
		console.info(`Generated ${questions.length} questions (via /question) of type "${type}"`);
		return res.status(200).json({ questions, success: true });
	} catch (err) {
		console.error('question route error:', err);
		return res.status(500).json({ success: false, message: 'Failed to generate questions', error: err.message });
	}
});

// POST /api/ai/evaluate
// body: { question, answer }
router.post('/evaluate', async (req, res, next) => {
	try {
		const { question, answer } = req.body || {};
		if (!question) return res.status(400).json({ success: false, message: 'Missing question' });
		const result = await aiController.evaluateAnswer(question, answer || '');
		return res.status(200).json({ ...result, success: true });
	} catch (err) {
		console.error('evaluate route error:', err);
		return res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: err.message });
	}
});

module.exports = router;
