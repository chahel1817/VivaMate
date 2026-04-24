const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const aiPrompt = require("../utils/aiPrompt");
const aiController = require("./aiController");
const resumeQueue = require("../queues/resumeQueue");

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

exports.extractText = extractText;

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

        // 2. Add to Queue for background processing
        const job = await resumeQueue.add(`analyze-resume-${req.user}`, {
            resumeText,
            userId: req.user,
            originalName: req.file.originalname,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 }
        });

        console.log(`[Queue] Added resume job: ${job.id} for user ${req.user}`);

        // 3. Return 202 Accepted immediately
        return res.status(202).json({
            success: true,
            message: "Resume analysis started in the background. You'll be notified once it's ready.",
            jobId: job.id
        });

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
