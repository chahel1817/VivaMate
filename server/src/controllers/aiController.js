const axios = require("axios");

/* ===============================
   GENERATE QUESTION
================================ */
exports.generateQuestion = async (req, res) => {
  try {
    const { domain, tech, difficulty } = req.body;

    if (!domain || !tech || !difficulty) {
      return res.status(400).json({ message: "domain, tech, difficulty required" });
    }

    const prompt = `
Ask ONE ${difficulty.toUpperCase()} level ${tech.toUpperCase()} interview question 
related to ${domain.toUpperCase()} development.

Rules:
- Only the question
- No explanation
- No numbering
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 120,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const question = response.data?.choices?.[0]?.message?.content?.trim();
    res.json({ question });
  } catch (err) {
    console.error("QUESTION ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "AI question failed" });
  }
};

/* ===============================
   EVALUATE ANSWER
================================ */
exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const prompt = `
Evaluate this interview answer and return JSON ONLY:

{
  "technicalScore": number (0-10),
  "clarityScore": number (0-10),
  "confidenceScore": number (0-10),
  "feedback": "2-3 lines"
}

Question:
${question}

Answer:
${answer}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 250,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content;
    const parsed = JSON.parse(raw);

    res.json({
      scores: {
        technical: parsed.technicalScore,
        clarity: parsed.clarityScore,
        confidence: parsed.confidenceScore,
      },
      feedback: parsed.feedback,
    });
  } catch (err) {
    console.error("EVALUATION ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "AI evaluation failed" });
  }
};

/* ===============================
   GENERATE SUMMARY (INTERNAL)
================================ */
exports.generateAISummary = async (responses, topic, difficulty) => {
  const text = responses
    .map(
      (r, i) =>
        `Q${i + 1}: ${r.question}
A: ${r.transcript}
Scores: T${r.scores.technical}, C${r.scores.clarity}, F${r.scores.confidence}`
    )
    .join("\n");

  const prompt = `
Analyze interview for ${topic.tech} (${topic.domain}) - ${difficulty}.

${text}

Return JSON ONLY:
{
  "overallScore": number,
  "recommendation": string,
  "strengths": [string],
  "weaknesses": [string]
}
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
};
