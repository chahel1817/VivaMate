const pdf = require("pdf-parse");
const aiPrompt = require("../utils/aiPrompt");
const aiController = require("./aiController");

exports.parseResume = async (req, res) => {
    try {
        console.log("Resume parse request received");
        console.log("Type of pdf:", typeof pdf);
        if (!req.file) {
            console.error("No file in request");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        console.log("Parsing PDF buffer, size:", req.file.buffer.length);
        // Parse PDF
        const dataBuffer = req.file.buffer;
        let pdfData;
        try {
            pdfData = await pdf(dataBuffer);
        } catch (pdfErr) {
            console.error("PDF Parsing error:", pdfErr);
            throw new Error("Failed to parse PDF file content.");
        }

        const resumeText = pdfData.text;
        console.log("Extracted text length:", resumeText?.length);

        if (!resumeText || resumeText.trim().length === 0) {
            console.error("Empty text extracted from PDF");
            return res.status(400).json({ success: false, message: "Could not extract text from PDF" });
        }

        // Use AI to extract skills
        console.log("Calling AI for resume data extraction...");
        const prompt = aiPrompt.resumeParserPrompt(resumeText);

        // We can reuse the AI controller's logic to call OpenRouter/OpenAI
        // Since we want JSON, we use the internal extractFirstJson or similar
        // For now, let's assume aiController has a method or we can call OpenRouter directly
        // Actually, let's use the logic from aiController to be safe

        const aiResponse = await aiController.generateResumeData(prompt);
        console.log("AI extraction successful:", aiResponse);

        if (aiResponse.isResume === false) {
            console.error("Uploaded file is not a resume according to AI");
            return res.status(400).json({
                success: false,
                message: "No other type of Pdf are allowed!!!!!!!"
            });
        }

        return res.status(200).json({
            success: true,
            data: aiResponse,
            textPreview: resumeText.substring(0, 500) + "..."
        });

    } catch (error) {
        console.error("Detailed Resume parsing error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const dataBuffer = req.file.buffer;
        let pdfData;
        try {
            pdfData = await pdf(dataBuffer);
        } catch (pdfErr) {
            console.error("PDF Parsing error:", pdfErr);
            throw new Error("Failed to parse PDF file content.");
        }

        const resumeText = pdfData.text;
        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Could not extract text from PDF" });
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
