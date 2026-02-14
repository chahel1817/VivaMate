const axios = require('axios');
const aiPrompt = require('../utils/aiPrompt');
const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// ==========================================
// HELPERS
// ==========================================

function normalizeText(t = '') {
	return String(t).replace(/[^\w\s]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashText(str = '') {
	let h = 5381;
	for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
	return String(h >>> 0);
}

function extractFirstJson(s = '') {
	if (!s) return null;
	const cleaned = s.replace(/```json/g, '').replace(/```/g, '').trim();
	const start = cleaned.indexOf('{');
	const end = cleaned.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) return null;
	const potentialJson = cleaned.slice(start, end + 1);
	try {
		return JSON.parse(potentialJson);
	} catch (e) {
		let depth = 0;
		for (let i = 0; i < cleaned.length; i++) {
			if (cleaned[i] === '{') {
				if (depth === 0) var sidx = i;
				depth++;
			}
			if (cleaned[i] === '}') {
				depth--;
				if (depth === 0 && typeof sidx !== 'undefined') {
					try { return JSON.parse(cleaned.slice(sidx, i + 1)); } catch (err) { }
				}
			}
		}
		return null;
	}
}

async function callOpenRouter(prompt) {
	console.log(`[AI] Calling OpenRouter (prompt length: ${prompt.length})...`);
	if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
	const body = {
		model: MODEL,
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.1,
		max_tokens: 3000
	};
	try {
		const res = await axios.post(OPENROUTER_API_URL, body, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'HTTP-Referer': 'https://vivamate.com',
				'X-Title': 'VivaMate AI'
			},
			timeout: 60000
		});
		return res.data?.choices?.[0]?.message?.content || '';
	} catch (error) {
		const msg = error.response?.data?.error?.message || error.message;
		throw new Error(`OpenRouter: ${msg}`);
	}
}

async function callOpenAI(prompt) {
	console.log(`[AI] Calling OpenAI (prompt length: ${prompt.length})...`);
	if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
	const body = {
		model: OPENAI_MODEL,
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.1
	};
	try {
		const res = await axios.post(OPENAI_API_URL, body, {
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
			timeout: 60000
		});
		return res.data?.choices?.[0]?.message?.content || '';
	} catch (error) {
		const msg = error.response?.data?.error?.message || error.message;
		throw new Error(`OpenAI: ${msg}`);
	}
}

function parseQuestionsFromLLM(content) {
	const parsed = extractFirstJson(content);
	if (!parsed) return [];
	let items = [];
	if (Array.isArray(parsed.questions)) items = parsed.questions;
	else if (parsed.question) items = [{ question: parsed.question }];
	else {
		for (const k of Object.keys(parsed)) {
			if (typeof parsed[k] === 'string') items.push({ question: parsed[k] });
		}
	}
	const map = new Map();
	for (const it of items) {
		const text = String(it.question ?? it.text ?? '').trim();
		if (!text) continue;
		const key = hashText(normalizeText(text));
		if (!map.has(key)) map.set(key, { ...it, _norm: normalizeText(text), _key: key });
	}
	return Array.from(map.values());
}

async function gatherExistingKeys({ sessionId, userId }) {
	const set = new Set();
	try {
		if (sessionId) {
			const q = mongoose.Types.ObjectId.isValid(sessionId) ?
				await InterviewSession.findById(sessionId).lean() :
				await InterviewSession.findOne({ sessionId }).lean();
			if (q && Array.isArray(q.questions)) {
				for (const it of q.questions) {
					const txt = String(it.question ?? it.text ?? it.prompt ?? '').trim();
					if (txt) set.add(hashText(normalizeText(txt)));
				}
			}
		}
		if (userId) {
			const sessions = await InterviewSession.find({ userId }).select('questions').lean().limit(100);
			for (const s of sessions) {
				if (!s.questions) continue;
				for (const it of s.questions) {
					const txt = String(it.question ?? it.text ?? '').trim();
					if (txt) set.add(hashText(normalizeText(txt)));
				}
			}
		}
	} catch (e) {
		console.warn('gatherExistingKeys error', e.message);
	}
	return set;
}

function applyGenerousScoreCurve(score) {
	const numScore = Number(score) || 0;
	let boosted = numScore;
	if (numScore <= 3) boosted += 2;
	else if (numScore <= 6) boosted += 1.5;
	else if (numScore <= 8) boosted += 1;
	else boosted += 0.5;
	return Math.round(Math.min(10, boosted) * 10) / 10;
}

// ==========================================
// EXPORTS
// ==========================================

exports.generateUniqueQuestions = async (options = {}) => {
	const { type = 'general', count = 5, sessionId = null, userId = null, maxAttempts = 3 } = options;
	const existingKeys = await gatherExistingKeys({ sessionId, userId });
	const result = [];
	const seen = new Set(existingKeys);

	let attempts = 0;
	let remaining = count;

	while (attempts < maxAttempts && result.length < count) {
		attempts++;
		const prompt = aiPrompt.generateQuestionPrompt(type, remaining);
		let content = null;
		try {
			content = await callOpenRouter(prompt);
		} catch (err) {
			if (OPENAI_API_KEY) content = await callOpenAI(prompt);
			else throw err;
		}

		if (content) {
			const items = parseQuestionsFromLLM(content);
			for (const it of items) {
				if (result.length >= count) break;
				if (!seen.has(it._key)) {
					seen.add(it._key);
					result.push({ question: it.question || it.text });
				}
			}
			remaining = count - result.length;
		}
	}
	return result;
};

exports.evaluateAnswer = async (question, answer) => {
	const prompt = aiPrompt.evaluateAnswerPrompt(question, answer);
	let content = null;
	try {
		content = await callOpenRouter(prompt);
	} catch (err) {
		if (OPENAI_API_KEY) content = await callOpenAI(prompt);
		else throw err;
	}
	const parsed = extractFirstJson(content);
	if (!parsed) throw new Error('Failed to evaluate answer');
	return {
		technicalScore: applyGenerousScoreCurve(parsed.technicalScore),
		clarityScore: applyGenerousScoreCurve(parsed.clarityScore),
		confidenceScore: applyGenerousScoreCurve(parsed.confidenceScore),
		feedback: parsed.feedback || 'Good effort!'
	};
};

exports.generateResumeData = async (prompt) => {
	let content = null;
	try {
		content = await callOpenRouter(prompt);
	} catch (err) {
		if (OPENAI_API_KEY) content = await callOpenAI(prompt);
		else throw err;
	}
	const parsed = extractFirstJson(content);
	if (!parsed) {
		console.error('Raw AI content:', content);
		throw new Error('Failed to parse AI resume data');
	}
	return parsed;
};

exports.generateQuestions = async (req, res) => {
	try {
		const { type = 'general', count = 5, sessionId = null, userId = null } = req.body;
		const questions = await exports.generateUniqueQuestions({ type, count, sessionId, userId });
		return res.status(200).json({ success: true, questions });
	} catch (err) {
		console.error('generateQuestions error:', err);
		return res.status(500).json({ success: false, error: err.message });
	}
};

exports.getDailyInsight = async (req, res) => {
	try {
		const { type = 'fact' } = req.query;
		const prompt = aiPrompt.generateInsightPrompt(type);
		let content = null;
		try {
			content = await callOpenRouter(prompt);
		} catch (err) {
			if (OPENAI_API_KEY) content = await callOpenAI(prompt);
			else throw err;
		}
		const parsed = extractFirstJson(content);
		if (!parsed) {
			return res.status(200).json({
				success: true,
				insight: {
					title: type === 'tip' ? "Daily Tip" : "Did You Know?",
					content: content.replace(/```json|```/g, '').trim(),
					type: type.toUpperCase()
				}
			});
		}
		return res.status(200).json({ success: true, insight: { ...parsed, type: type.toUpperCase() } });
	} catch (err) {
		return res.status(500).json({ success: false, error: err.message });
	}
};

exports.health = (req, res) => {
	res.status(200).json({ status: 'ok', openrouter: !!OPENROUTER_API_KEY, openai: !!OPENAI_API_KEY });
};
