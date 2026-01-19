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

  // Detect difficulty from type string
  const lowerType = type.toLowerCase();
  let difficultyLevel = "Mid-level";
  let styleNote = "";

  if (lowerType.includes("easy")) {
    difficultyLevel = "Beginner (Entry-level)";
    styleNote = "- Focus on fundamental definitions, core concepts, and basic principles.\n- Keep questions clear, direct, and concise (one or two sentences max).\n- Questions should be easy to understand and answer for someone new to the topic.";
  } else if (lowerType.includes("hard") || lowerType.includes("expert")) {
    difficultyLevel = "Senior/Expert";
    styleNote = "- Focus on advanced architecture, optimization, complex problem-solving, and edge cases.\n- Can include situational contexts or architectural scenarios.\n- Questions should be challenging and require deep technical knowledge.";
  } else {
    difficultyLevel = "Mid-level";
    styleNote = "- Focus on a mix of conceptual understanding and practical application.\n- Questions should be professional and standard for technical interviews.";
  }

  return `You are a senior technical interviewer creating clear, effective, and level-appropriate interview questions.

Generate ${count} ${count === 1 ? 'technical interview question' : 'UNIQUE and DISTINCT technical interview questions'} for the following category: ${type}

Target Difficulty: ${difficultyLevel}

Requirements:
- Each question must be COMPLETELY UNIQUE and different from others.
- Questions should cover different aspects of ${type}.
${styleNote}
- Use professional wording and clear phrasing.
- DO NOT generate overly descriptive, lengthy, or complex word problems unless the difficulty is 'Hard'.
- For 'Easy' difficulty, prioritize "What is..." or "Define..." style questions.${uniquenessNote}

Give output ONLY in valid JSON format:
{
  "questions": [
    { "question": "question text" }
  ]
}

Ensure all questions are practical and suitable for an interview context.`;
};
