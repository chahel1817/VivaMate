const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    feedback: {
      type: String,
    },

    scores: {
      technical: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },

    interviewType: {
      type: String,
      default: "mern",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
