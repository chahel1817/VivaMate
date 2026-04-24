const { Worker } = require('bullmq');
const { connection } = require('../config/bullmq');
const aiPrompt = require("../utils/aiPrompt");
const aiController = require("../controllers/aiController");
const User = require("../models/User");
const Sentry = require("@sentry/node");

const resumeWorker = new Worker('resume-analysis', async (job) => {
    const { resumeText, userId, socketId } = job.data;

    console.log(`[Worker] Started processing resume for user: ${userId} (Job ID: ${job.id})`);

    try {
        const prompt = aiPrompt.resumeScoringPrompt(resumeText);
        const analysis = await aiController.generateResumeData(prompt);

        // 1. Update user record
        await User.findByIdAndUpdate(userId, { hasResume: true });

        // 2. Notify frontend via Socket.io
        if (global.io) {
            global.io.emit(`resume-analysis-completed:${userId}`, {
                success: true,
                analysis,
                jobId: job.id
            });
            console.log(`[Worker] Socket.io event emitted for user: ${userId}`);
        }

        console.log(`[Worker] Completed job: ${job.id}`);
        return analysis;

    } catch (error) {
        console.error(`[Worker] Failed job ${job.id}:`, error.message);

        // Report error to Sentry
        Sentry.captureException(error, {
            extra: { jobId: job.id, userId: userId }
        });

        // Notify frontend of failure
        if (global.io) {
            global.io.emit(`resume-analysis-completed:${userId}`, {
                success: false,
                message: "AI analysis failed in background",
                jobId: job.id
            });
        }

        throw error;
    }
}, { connection });

console.log('Resume Worker started and listening for jobs...');

module.exports = resumeWorker;
