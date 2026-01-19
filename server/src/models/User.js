const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    careerStage: {
      type: String,
      default: "",
    },
    geoPresence: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    resetOtp: String,
    resetOtpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
