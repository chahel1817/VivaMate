const { resumeParserPrompt } = require('./src/utils/aiPrompt');

const resumeText = "Chahel Singh\nSoftware Engineer\nSkills: React, Node.js, MongoDB\nExperience: Worked at XYZ...";
const nonResumeText = "This is a recipe for chocolate cake. Ingredients: 2 cups flour, 1 cup sugar...";

console.log("Testing Resume Prompt with Resume Text:");
console.log(resumeParserPrompt(resumeText));

console.log("\nTesting Resume Prompt with Non-Resume Text:");
console.log(resumeParserPrompt(nonResumeText));

// Simulated Controller Logic
function testController(aiResponse) {
    if (aiResponse.isResume === false) {
        return { status: 400, message: "No other type of Pdf are allowed!!!!!!!" };
    }
    return { status: 200, data: aiResponse };
}

console.log("\nSimulated Controller Response (Resume):");
console.log(testController({ isResume: true, skills: ["React"] }));

console.log("\nSimulated Controller Response (Non-Resume):");
console.log(testController({ isResume: false, skills: [] }));
