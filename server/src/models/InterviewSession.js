const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    topic: {
      domain: { type: String, required: true },
      tech: { type: String, required: true },
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    interviewType: {
      type: String,
      required: true,
    },

    overallScore: Number,
    recommendation: String,
    strengths: [String],
    weaknesses: [String],

    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
