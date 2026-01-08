exports.evaluateAnswerPrompt = (question, answer) => `
You are a senior technical interviewer.

Evaluate the candidate's answer strictly and objectively.

Question:
"${question}"

Candidate Answer:
"${answer}"

Give output ONLY in valid JSON:
{
  "technicalScore": number (0-10),
  "clarityScore": number (0-10),
  "confidenceScore": number (0-10),
  "feedback": "short actionable feedback"
}
`;

exports.generateQuestionPrompt = (type) => `
You are a senior technical interviewer.

Generate a technical interview question for the following category: ${type}

The question should be challenging but appropriate for a mid-level developer.

Give output ONLY in valid JSON:
{
  "question": "the interview question text"
}
`;
