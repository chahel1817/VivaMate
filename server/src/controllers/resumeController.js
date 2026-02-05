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
