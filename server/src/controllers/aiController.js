const axios = require("axios");

/*
  ===============================
  GENERATE INTERVIEW QUESTION
  ===============================
*/
exports.generateQuestion = async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "OpenRouter API key not configured" });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Interview type is required" });
    }

    // Fallback-safe prompt (no dependency risk)
    const prompt = `Ask ONE ${type.toUpperCase()} technical interview question.
Only return the question text. Do not explain anything.`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  Referer: req.headers.origin || "http://localhost:5173",
  "X-Title": "InterviewIQ",
  "User-Agent": "InterviewIQ/1.0",   // 🔥 REQUIRED
  "Content-Type": "application/json",
}
,
        withCredentials: true,
      }
    );

    const question = response.data?.choices?.[0]?.message?.content;

    if (!question) {
      throw new Error("No question returned from OpenRouter");
    }

    res.json({ question });
  } catch (error) {
    console.error(
      "OPENROUTER QUESTION ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "AI quiz generation failed",
    });
  }
};

/*
  ===============================
  EVALUATE ANSWER
  ===============================
*/
exports.evaluateAnswer = async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "OpenRouter API key not configured" });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Question and answer are required" });
    }

    const prompt = `
You are an interview evaluator.

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer and return feedback in plain text.
Mention:
- Technical accuracy
- Clarity
- Confidence
- One improvement suggestion
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 300,
      },
      {
        headers: {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  Referer: req.headers.origin || "http://localhost:5173",
  "X-Title": "InterviewIQ",
  "User-Agent": "InterviewIQ/1.0",   // 🔥 REQUIRED
  "Content-Type": "application/json",
}
,
        withCredentials: true,
      }
    );

    const feedback = response.data?.choices?.[0]?.message?.content;

    if (!feedback) {
      throw new Error("No feedback returned from OpenRouter");
    }

    res.json({ feedback });
  } catch (error) {
    console.error(
      "OPENROUTER EVALUATION ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "AI evaluation failed",
    });
  }
};
