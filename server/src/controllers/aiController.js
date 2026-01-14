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

// Helpers
function normalizeText(t = '') {
	return String(t).replace(/[^\w\s]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}
function hashText(str = '') {
	let h = 5381;
	for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
	return String(h >>> 0);
}
function extractFirstJson(s = '') {
	const start = s.indexOf('{');
	const end = s.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) return null;
	try {
		return JSON.parse(s.slice(start, end + 1));
	} catch (e) {
		let depth = 0;
		for (let i = 0; i < s.length; i++) {
			if (s[i] === '{') { if (depth === 0) var sidx = i; depth++; }
			if (s[i] === '}') {
				depth--;
				if (depth === 0 && typeof sidx !== 'undefined') {
					try { return JSON.parse(s.slice(sidx, i + 1)); } catch (err) { }
				}
			}
		}
		return null;
	}
}
async function callOpenRouter(prompt) {
	console.log('OPENROUTER_API_KEY present:', !!OPENROUTER_API_KEY);
	if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
	
	const body = {
		model: MODEL,
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.9, // Increased for more variety and uniqueness
		max_tokens: 2000, // Increased to allow for multiple questions
		top_p: 0.95, // Nucleus sampling for diversity
		frequency_penalty: 0.5, // Reduce repetition
		presence_penalty: 0.6 // Encourage new topics/concepts
	};
	
	console.log('Calling OpenRouter with model:', MODEL);
	console.log('OpenRouter URL:', OPENROUTER_API_URL);
	
	try {
		const res = await axios.post(OPENROUTER_API_URL, body, {
			headers: { 
				'Content-Type': 'application/json', 
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'HTTP-Referer': process.env.OPENROUTER_REFERER || 'https://vivamate.com',
				'X-Title': 'VivaMate Quiz Generator'
			},
			timeout: 45000, // Increased timeout for better reliability
			validateStatus: function (status) {
				return status >= 200 && status < 500; // Don't throw on 4xx errors, we'll handle them
			}
		});
		
		// Check for API errors
		if (res.status >= 400) {
			const errorMsg = res.data?.error?.message || res.data?.message || `HTTP ${res.status}`;
			console.error('OpenRouter API error:', errorMsg, res.data);
			throw new Error(`OpenRouter API error: ${errorMsg}`);
		}
		
		const json = res.data || {};
		const content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? '';
		
		if (!content) {
			console.error('OpenRouter response structure:', JSON.stringify(json, null, 2));
			throw new Error('Empty response from OpenRouter');
		}
		
		console.log('OpenRouter response received, length:', content.length);
		return content;
	} catch (error) {
		// Handle network errors specifically
		if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			const networkError = new Error(`Network error connecting to OpenRouter: ${error.message}. Please check your internet connection and DNS settings.`);
			networkError.code = error.code;
			throw networkError;
		}
		
		// Handle axios errors
		if (error.response) {
			const errorMsg = error.response.data?.error?.message || error.response.data?.message || `HTTP ${error.response.status}`;
			console.error('OpenRouter API error response:', error.response.status, errorMsg);
			throw new Error(`OpenRouter API error: ${errorMsg}`);
		}
		
		// Re-throw other errors
		console.error('OpenRouter API call failed:', error.message);
		throw error;
	}
}
async function callOpenAI(prompt) {
	if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
	const body = {
		model: OPENAI_MODEL,
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.9, // Increased for more variety
		max_tokens: 2000, // Increased to allow for multiple questions
		top_p: 0.95,
		frequency_penalty: 0.5,
		presence_penalty: 0.6
	};
	try {
		const res = await axios.post(OPENAI_API_URL, body, {
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
			timeout: 45000
		});
		const json = res.data || {};
		const content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? '';
		if (!content) {
			console.error('OpenAI response structure:', JSON.stringify(json, null, 2));
			throw new Error('Empty response from OpenAI');
		}
		return content;
	} catch (error) {
		console.error('OpenAI API call failed:', error.response?.data || error.message);
		throw error;
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
					if (!txt) continue;
					set.add(hashText(normalizeText(txt)));
				}
			}
		}
		if (userId) {
			const sessions = await InterviewSession.find({ userId }).select('questions').lean().limit(200);
			for (const s of sessions || []) {
				if (!Array.isArray(s.questions)) continue;
				for (const it of s.questions) {
					const txt = String(it.question ?? it.text ?? '').trim();
					if (!txt) continue;
					set.add(hashText(normalizeText(txt)));
				}
			}
		}
	} catch (e) {
		console.warn('gatherExistingKeys error', e.message);
	}
	return set;
}

// Main function: only uses OpenRouter/OpenAI, always returns unique questions or throws error
async function generateUniqueQuestions(options = {}) {
	const { type = 'general', count = 5, sessionId = null, userId = null, maxAttempts = 5 } = options;
	if (count <= 0) return [];

	const existingKeys = await gatherExistingKeys({ sessionId, userId });
	const result = [];
	const seen = new Set(existingKeys);
	
	// Get existing question texts for prompt (limited to avoid token limits)
	const existingQuestions = [];
	if (sessionId) {
		try {
			const q = mongoose.Types.ObjectId.isValid(sessionId) ?
				await InterviewSession.findById(sessionId).lean() :
				await InterviewSession.findOne({ sessionId }).lean();
			if (q && Array.isArray(q.questions)) {
				for (const it of q.questions) {
					const txt = String(it.question ?? it.text ?? it.prompt ?? '').trim();
					if (txt) existingQuestions.push(txt);
				}
			}
		} catch (e) {
			console.warn('Error fetching existing questions for prompt:', e.message);
		}
	}
	// Limit to last 10 questions to avoid token limits
	const recentExistingQuestions = existingQuestions.slice(-10);

	let attempts = 0;
	let remaining = count;

	console.log(`Starting question generation: type="${type}", count=${count}, existingKeys=${existingKeys.size}`);

	while (attempts < maxAttempts && result.length < count) {
		attempts++;
		console.log(`Attempt ${attempts}/${maxAttempts}: Generating ${remaining} questions...`);
		
		// Generate prompt with existing questions context
		const prompt = aiPrompt.generateQuestionPrompt(type, remaining, recentExistingQuestions);

		let content = null;
		let error = null;

		// Try OpenRouter first
		try {
			content = await callOpenRouter(prompt);
			console.info(`✓ OpenRouter generated response (attempt ${attempts})`);
		} catch (err) {
			error = err;
			// Check if it's a network/DNS error
			if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
				console.error(`✗ OpenRouter network error (attempt ${attempts}):`, err.message);
				console.error('   This usually means:');
				console.error('   1. No internet connection');
				console.error('   2. DNS resolution failure');
				console.error('   3. Firewall/proxy blocking the connection');
				console.error('   4. OpenRouter API is down');
				
				// If it's a network error, don't retry immediately - wait a bit
				if (attempts < maxAttempts) {
					console.log(`   Waiting 2 seconds before retry...`);
					await new Promise(resolve => setTimeout(resolve, 2000));
				}
			} else {
				console.warn(`✗ OpenRouter failed (attempt ${attempts}):`, err.message);
			}
			
			// Try OpenAI as fallback (only if OpenAI key is configured)
			if (OPENAI_API_KEY) {
				try {
					content = await callOpenAI(prompt);
					console.info(`✓ OpenAI fallback generated response (attempt ${attempts})`);
				} catch (openaiErr) {
					console.error(`✗ OpenAI also failed (attempt ${attempts}):`, openaiErr.message);
					if (attempts >= maxAttempts) {
						const errorDetails = err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' 
							? `Network error: ${err.message}. Please check your internet connection.`
							: `OpenRouter (${error.message}), OpenAI (${openaiErr.message})`;
						throw new Error(`Failed to generate questions after ${maxAttempts} attempts: ${errorDetails}`);
					}
					// Continue to next attempt
					continue;
				}
			} else {
				// No OpenAI fallback available
				if (attempts >= maxAttempts) {
					const errorDetails = err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' 
						? `Network error: ${err.message}. Please check your internet connection and DNS settings.`
						: error.message;
					throw new Error(`Failed to generate questions after ${maxAttempts} attempts: ${errorDetails}`);
				}
				// Continue to next attempt
				continue;
			}
		}

		if (content) {
			const items = parseQuestionsFromLLM(content || '');
			console.log(`Parsed ${items.length} questions from LLM response`);
			
			let added = 0;
			for (const it of items) {
				if (result.length >= count) break;
				if (!it._key) {
					it._norm = normalizeText(it.question || it.text || '');
					it._key = hashText(it._norm);
				}
				if (seen.has(it._key)) {
					console.warn(`⚠ Skipping duplicate question: "${(it.question || it.text || '').substring(0, 60)}..."`);
					continue;
				}
				seen.add(it._key);
				result.push({ question: it.question || it.text, _norm: it._norm, _key: it._key });
				added++;
			}
			
			console.log(`Added ${added} new unique questions. Total: ${result.length}/${count}`);
			remaining = count - result.length;
			
			if (remaining > 0 && attempts < maxAttempts) {
				console.log(`Need ${remaining} more questions, continuing...`);
			}
		}
	}
	
	if (result.length < count) {
		const errorMsg = `Could not generate enough unique questions: got ${result.length}/${count} after ${maxAttempts} attempts`;
		console.error(errorMsg);
		throw new Error(errorMsg);
	}
	
	console.log(`✓ Successfully generated ${result.length} unique questions`);
	return result.slice(0, count).map(q => ({ question: q.question }));
}

// Evaluate answer using AI
async function evaluateAnswer(question, answer) {
	const prompt = aiPrompt.evaluateAnswerPrompt(question, answer);

	let content = null;
	let error = null;

	// Try OpenRouter first
	try {
		content = await callOpenRouter(prompt);
		console.info('Used OpenRouter for answer evaluation');
	} catch (err) {
		error = err;
		console.warn('OpenRouter failed, trying OpenAI:', err.message);
		// Try OpenAI as fallback
		try {
			content = await callOpenAI(prompt);
			console.info('Used OpenAI fallback for answer evaluation');
		} catch (openaiErr) {
			console.error('OpenAI also failed:', openaiErr.message);
			throw new Error(`Failed to evaluate answer: OpenRouter (${error.message}), OpenAI (${openaiErr.message})`);
		}
	}

	const parsed = extractFirstJson(content || '');
	if (!parsed) throw new Error('Invalid response from AI for evaluation');

	return {
		technicalScore: parsed.technicalScore || 0,
		clarityScore: parsed.clarityScore || 0,
		confidenceScore: parsed.confidenceScore || 0,
		feedback: parsed.feedback || 'No feedback provided'
	};
}

// Express controllers
exports.generateQuestions = async (req, res) => {
	try {
		console.log('generateQuestions request body:', req.body);

		if (!OPENROUTER_API_KEY && !OPENAI_API_KEY) {
			console.error('No AI API key configured in environment.');
			return res.status(500).json({ success: false, error: 'No AI API key configured in environment.' });
		}

		const { type = 'general', count = 5, sessionId = null, userId = null } = req.body || {};

		if (typeof count !== 'number' || count <= 0 || count > 20) {
			console.error('Invalid count:', count);
			return res.status(400).json({ success: false, error: 'Invalid count. Must be a number between 1 and 20.' });
		}

		if (!type || typeof type !== 'string') {
			console.error('Invalid type:', type);
			return res.status(400).json({ success: false, error: 'Invalid type. Must be a non-empty string.' });
		}

		const questions = await generateUniqueQuestions({ type, count, sessionId, userId });
		console.log(`Generated ${questions.length} questions for type "${type}":`, questions);
		return res.status(200).json({ success: true, questions });
	} catch (err) {
		console.error('generateQuestions error:', err && err.stack ? err.stack : err);
		return res.status(500).json({ success: false, error: err && err.message ? err.message : 'Internal Server Error' });
	}
};

// Optional: Add a health check endpoint for debugging
exports.health = (req, res) => {
    res.status(200).json({ status: 'ok', openrouter: !!OPENROUTER_API_KEY, openai: !!OPENAI_API_KEY });
};

exports.evaluateAnswer = evaluateAnswer;
exports.generateUniqueQuestions = generateUniqueQuestions;
