const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        type: { type: String, default: "multiple-choice" }
    }],
    xpReward: { type: Number, default: 200 }, // Total XP for completing all
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Varies"], default: "Medium" }
}, { timestamps: true });

module.exports = mongoose.model("DailyChallenge", challengeSchema);
