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

exports.generateQuestionPrompt = (type, count = 1, existingQuestions = []) => {
	const uniquenessNote = existingQuestions.length > 0 
		? `\nIMPORTANT: The questions must be COMPLETELY DIFFERENT from these existing questions:\n${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nAvoid any similarity in wording, concepts, or approach.`
		: '';
	
	return `You are a senior technical interviewer specializing in creating diverse, unique interview questions.

Generate ${count} ${count === 1 ? 'technical interview question' : 'UNIQUE and DISTINCT technical interview questions'} for the following category: ${type}

Requirements:
- Each question must be COMPLETELY UNIQUE and different from others
- Questions should cover different aspects, concepts, and problem-solving approaches
- Vary the difficulty levels, question types (conceptual, practical, algorithmic, design)
- Use different wording, phrasing, and examples
- The questions should be challenging but appropriate for a mid-level developer
- Make each question stand out with unique scenarios or contexts${uniquenessNote}

Give output ONLY in valid JSON format:
{
  "questions": [
    { "question": "first unique question text" },
    { "question": "second unique question text" }
  ]
}

If generating only one question, still use the array format:
{
  "questions": [
    { "question": "the unique interview question text" }
  ]
}`;
};
