const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const aiPrompt = require("../utils/aiPrompt");
const aiController = require("./aiController");

/**
 * Extracts plain text from a PDF or DOCX buffer.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>}
 */
async function extractText(buffer, mimetype) {
    const isDocx = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        || mimetype === 'application/msword';

    if (isDocx) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    // Default: treat as PDF
    const data = await pdf(buffer);
    return data.text;
}

exports.parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        let resumeText;
        try {
            resumeText = await extractText(req.file.buffer, req.file.mimetype);
        } catch (parseErr) {
            console.error("File parsing error:", parseErr);
            throw new Error("Could not extract text from the uploaded file.");
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Could not extract text from the file" });
        }

        const prompt = aiPrompt.resumeParserPrompt(resumeText);
        const aiResponse = await aiController.generateResumeData(prompt);

        if (aiResponse.isResume === false) {
            return res.status(400).json({ success: false, message: "Only resume files are allowed." });
        }

        return res.status(200).json({
            success: true,
            data: aiResponse,
            textPreview: resumeText.substring(0, 500) + "..."
        });

    } catch (error) {
        console.error("Resume parsing error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        let resumeText;
        try {
            resumeText = await extractText(req.file.buffer, req.file.mimetype);
        } catch (parseErr) {
            console.error("File parsing error:", parseErr);
            return res.status(400).json({ success: false, message: "Could not read the uploaded file. Please upload a valid PDF or Word document." });
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Could not extract text from the file" });
        }

        // Use AI to score and analyze
        console.log("[Resume] Starting AI analysis...");
        const prompt = aiPrompt.resumeScoringPrompt(resumeText);
        let analysis;

        try {
            analysis = await aiController.generateResumeData(prompt);
        } catch (aiErr) {
            console.error("[Resume] AI analysis failed:", aiErr.message);
            return res.status(500).json({
                success: false,
                message: "AI analysis failed. This could be due to a connection issue or high traffic. Please try again in a moment."
            });
        }

        // Validate analysis structure roughly
        if (!analysis.overallScore || !analysis.breakdown) {
            console.error("[Resume] Invalid analysis structure received from AI");
            return res.status(500).json({
                success: false,
                message: "Received an incomplete analysis from the AI. Please try re-uploading."
            });
        }

        // Add defaults if missing to prevent frontend crashes
        analysis.verdict = analysis.verdict || "Needs Improvement";
        analysis.detectedRole = analysis.detectedRole || { role: "Professional", industry: "Technology", confidence: 0 };
        analysis.jdMatch = analysis.jdMatch || { overall: 0, requiredMatched: 0, preferredMatched: 0, text: "No match data available" };

        analysis.sectionDensity = analysis.sectionDensity || [];
        analysis.jobTitleAlignment = analysis.jobTitleAlignment || { score: 0, suggestedTitle: "N/A", analysis: "N/A" };
        analysis.bulletRewrites = analysis.bulletRewrites || [];
        analysis.missingSections = analysis.missingSections || [];
        analysis.synonyms = analysis.synonyms || [];
        analysis.redFlags = analysis.redFlags || [];
        analysis.atsSimulation = analysis.atsSimulation || { rawExtraction: "No extraction data.", detectedSections: [] };
        analysis.benchmarks = analysis.benchmarks || { roleAverage: 70, topScore: 95, yourPercentile: 50 };

        analysis.keywords = analysis.keywords || { matched: [], missing: [] };
        analysis.formatting = analysis.formatting || { isOneColumn: true, hasTables: false, hasStandardHeadings: true, issues: [] };
        analysis.experience = analysis.experience || { relevantYears: 0, gaps: [] };
        analysis.quantification = analysis.quantification || { score: 0 };
        analysis.improvements = analysis.improvements || [];

        // Update user's hasResume flag
        if (req.user && req.user.id) {
            const User = require("../models/User");
            await User.findByIdAndUpdate(req.user.id, { hasResume: true });
        }

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
