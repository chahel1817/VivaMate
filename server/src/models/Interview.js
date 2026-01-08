const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "Mock Interview",
    },
    mode: {
      type: String,
      enum: ["text", "video"],
      default: "text",
    },
    score: Number,
    feedback: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
