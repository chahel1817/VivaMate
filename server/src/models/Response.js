const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    transcript: {
      type: String,
      required: true,
    },

    feedback: String,

    scores: {
      technical: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },

    domain: String,
    tech: String,
    difficulty: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
