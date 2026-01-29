exports.evaluateAnswerPrompt = (question, answer) => `
You are a supportive and encouraging technical interviewer who believes in recognizing effort and understanding.

Evaluate the candidate's answer with a GENEROUS and LENIENT approach:

SCORING GUIDELINES (Be generous!):
- **8-10**: Answer shows good understanding, covers key points (even if not perfect)
- **6-7**: Answer demonstrates reasonable knowledge or effort, partial correctness
- **4-5**: Answer shows some relevant understanding or attempt, basic grasp of concept
- **2-3**: Answer is mostly incorrect but shows minimal effort or awareness
- **0-1**: No answer, completely off-topic, or nonsensical

IMPORTANT RULES:
✓ Give credit for ANY correct information, even if incomplete
✓ Reward effort and reasonable attempts
✓ If the answer touches on the right concept, give at least 6-7 points
✓ Be lenient with minor mistakes or missing details
✓ Focus on what they GOT RIGHT, not what they missed
✓ Assume good intent and understanding unless clearly wrong
✓ For clarity and confidence, be even MORE generous (7-9 range is normal)

Question:
"${question}"

Candidate Answer:
"${answer}"

Give output ONLY in valid JSON:
{
  "technicalScore": number (0-10, aim for 6-9 for reasonable answers),
  "clarityScore": number (0-10, aim for 7-9 for most answers),
  "confidenceScore": number (0-10, aim for 7-9 for most answers),
  "feedback": "short, encouraging, and actionable feedback highlighting what they did well"
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
exports.generateDailyChallengePrompt = (count = 5) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

  let topic = "Full-Stack Web Development (Mix)";
  if (today === "Monday") topic = "Frontend Development (React, CSS, HTML)";
  if (today === "Tuesday") topic = "Backend Development (Node.js, Express, APIs)";
  if (today === "Wednesday") topic = "Databases (MongoDB, SQL, Schema Design)";
  if (today === "Thursday") topic = "JavaScript Core (ES6+, Async/Await, Closures)";
  if (today === "Friday") topic = "System Design & Architecture (Scalability, Security, Patterns)";
  if (today === "Saturday") topic = "Algorithms, Data Structures & Logic";

  return `
You are a senior technical interviewer creating a daily coding challenge quiz.
Today is ${today}, so the theme is: ${topic}.

Generate ${count} multiple-choice questions testing ONLY ${topic}.

Requirements:
- Questions should be challenging but solvable (Mid-Senior Level).
- Strictly adhere to the theme: ${topic}.
- Provide 4 distinct options for each question.
- Clearly identify the correct answer.

Give output ONLY in valid JSON format:
{
  "questions": [
    {
       "question": "Question text here?",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correctAnswer": "Option B",
       "type": "multiple-choice"
    }
  ]
}
`;
};
