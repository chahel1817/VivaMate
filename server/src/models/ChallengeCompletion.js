const mongoose = require("mongoose");

const challengeCompletionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "DailyChallenge" },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession" },
    date: { type: Date, required: true },
    dayKey: { type: String, required: true, index: true }, // YYYY-MM-DD in IST
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    type: { type: String, enum: ["challenge", "interview"], default: "challenge" },
    xpEarned: { type: Number, default: 0 }
  },
  { timestamps: true }
);

challengeCompletionSchema.index({ user: 1, dayKey: 1 });

module.exports = mongoose.model("ChallengeCompletion", challengeCompletionSchema);
