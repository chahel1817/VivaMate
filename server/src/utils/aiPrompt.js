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
exports.resumeParserPrompt = (text) => `
You are an expert technical recruiter and AI resume analyzer.
Your task is to extract key professional information from the following resume text.

Resume Text:
"""
${text}
"""

 Extract the following in JSON format:
1. "isResume": A boolean indicating if this text represents a professional resume or CV. Set to false if it's a random document, book, manual, or anything else.
2. "skills": A list of top 5-7 most relevant technical skills (e.g., "React.js", "Node.js", "PostgreSQL").
3. "projects": A list of 2-3 most significant projects described in the resume. 
4. "domain": The primary domain (e.g., "Full-stack Developer", "Frontend Engineer", "Data Scientist").
5. "experienceLevel": Estimated level (e.g., "Fresher", "Mid-level", "Senior").

Rules:
- Be precise. If skills are missing, infer from project descriptions.
- Focus on modern tech stacks mentioned.
- Ignore personal information (names, emails, addresses).
- If "isResume" is false, other fields can be empty/null.

Give output ONLY in valid JSON:
{
  "isResume": true/false,
  "skills": [],
  "projects": [],
  "domain": "",
  "experienceLevel": ""
}
`;

exports.generateInsightPrompt = (type = 'fact') => {
  if (type === 'tip') {
    return `
Generate a single, bite-sized, high-impact daily interview tip for a software engineer.
Focus on either behavioral techniques (like STAR), technical communication, mindset, or preparation strategy.

The response must be valid JSON:
{
  "title": "A catchy title (3-5 words)",
  "content": "The tip content. Must be practical, actionable, and 2-3 sentences long."
}
`;
  } else {
    return `
Generate a single, fascinating, and lesser-known historical or technical fact about programming languages, computers, or software engineering.
Focus on the "Why" or "Who" behind famous tech (e.g., Javascript's 10-day creation, why it's called Python, etc.).

The response must be valid JSON:
{
  "title": "A catchy title (3-5 words)",
  "content": "The fact content. Must be engaging, surprising, and 2-3 sentences long."
}
`;
  }
};

exports.resumeScoringPrompt = (text) => `
You are a state-of-the-art ATS (Applicant Tracking System) Parser and Senior Technical Recruiter.
Conduct a deep-scan analysis of the provided resume text.

Resume Text:
"""
${text}
"""

---
### ADVANCED ANALYSIS REQUIREMENTS:

1. **Role & Industry Detection**: Identify the candidate's primary role and industry. Provide a confidence score.
2. **Inferred JD Match**: Simulate a target Job Description match based on the detected role. Calculate a match % (Required vs Preferred).
3. **Section-wise Keyword Density**: Analyze keyword distribution across Skills, Experience, Projects, and Summary sections.
4. **Job Title Alignment**: Compare current and previous job titles against the industry standard for the target role. Suggest an optimized title.
5. **Actionable Bullet Rewrites**: Identify 2-3 weak bullet points and provide "Before" vs "ATS-Optimized" (quantified) versions.
6. **Missing Sections**: Detect if Summary, Projects, Certifications, or Contact info are missing.
7. **Synonym & Semantic Intelligence**: Map technical terms to synonyms (e.g., SQL -> PostgreSQL).
8. **Red Flags**: Identify recruiter auto-rejection risks (no metrics, length > 2 pages, gaps, etc.).
9. **ATS Parser Simulation**: Provide a plain-text version of how an older ATS would extract the key sections.
10. **Benchmark Comparison**: Compare the score against industry averages for that specific role.

---
### OUTPUT FORMAT (JSON ONLY):

{
  "overallScore": number,
  "verdict": "string",
  "detectedRole": { "role": "string", "industry": "string", "confidence": number },
  "jdMatch": { 
    "overall": number, 
    "requiredMatched": number, 
    "preferredMatched": number,
    "text": "Your resume matches X% of the inferred JD for [Role]"
  },
  
  "breakdown": {
    "keywords": { "score": number, "max": 40 },
    "experience": { "score": number, "max": 25 },
    "formatting": { "score": number, "max": 15 },
    "education": { "score": number, "max": 10 },
    "completeness": { "score": number, "max": 10 }
  },

  "sectionDensity": [
    { "section": "Skills", "coverage": number, "status": "Good/Warning/Critical" },
    { "section": "Experience", "coverage": number, "status": "..." }
  ],

  "jobTitleAlignment": {
    "score": number,
    "suggestedTitle": "string",
    "analysis": "string"
  },

  "bulletRewrites": [
    { "before": "string", "after": "string", "impact": "description" }
  ],

  "missingSections": ["List", "of", "missing", "sections"],

  "synonyms": [
    { "original": "Term in resume", "inferred": "Official ATS keyword matched", "reason": "Why it was matched" }
  ],

  "redFlags": [
    {
      "type": "string",
      "risk": "High/Medium",
      "message": "The problem found",
      "solution": "Actionable fix",
      "example": "Bad version -> Good version"
    }
  ],

  "atsSimulation": {
     "rawExtraction": "first 500 chars of plain text extraction simulation",
     "detectedSections": ["List of detected headings"]
  },

  "benchmarks": {
    "roleAverage": number,
    "topScore": number,
    "yourPercentile": number
  },

  "keywords": {
    "matched": ["string"],
    "missing": [{ "term": "string", "priority": "High/Medium" }]
  },

  "formatting": {
    "isOneColumn": boolean,
    "hasTables": boolean,
    "hasStandardHeadings": boolean,
    "issues": ["string"]
  },

  "experience": {
    "relevantYears": number,
    "gaps": ["string"]
  },

  "quantification": {
    "score": number
  },

  "improvements": [
    { "priority": "High", "issue": "string", "solution": "string" }
  ]
}
`;
