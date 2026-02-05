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
      domain: String,
      tech: String,
    },

    difficulty: String,
    totalQuestions: Number,
    isResumeMode: { type: Boolean, default: false },

    questions: {
      type: [String], // 👈 IMPORTANT
      default: [],
    },

    overallScore: Number,
    averageTechnical: Number,
    averageClarity: Number,
    averageConfidence: Number,
    consistencyScore: Number,
    consistencyNote: String,
    recommendation: String,
    strengths: [String],
    weaknesses: [String],
    perQuestionFeedback: [{
      question: String,
      answer: String,
      technicalScore: Number,
      clarityScore: Number,
      confidenceScore: Number,
      feedback: String,
    }],
    skillMetrics: [{
      skill: String,
      averageScore: Number,
      count: Number,
    }],

    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
