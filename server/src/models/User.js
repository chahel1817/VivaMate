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
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }], // e.g., "Novice", "Streak Master"
    completedChallenges: [{
      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge' },
      date: Date,
      score: Number,
      total: Number,
      xpEarned: Number
    }],
    streak: { type: Number, default: 0 },
    lastChallengeDate: { type: Date, default: null },
    bookmarks: [{
      questionId: String, // Or just embed the question content
      question: String,
      options: [String],
      correctAnswer: String,
      type: String,
      savedAt: { type: Date, default: Date.now }
    }],

    // Achievements & Gamification
    achievements: [{
      achievementId: String,
      unlockedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 }
    }],

    weeklyStats: {
      currentWeek: String, // "2026-W05"
      weeklyXP: { type: Number, default: 0 },
      weeklyChallenges: { type: Number, default: 0 }
    },

    leaderboardStats: {
      globalRank: Number,
      weeklyRank: Number,
      lastUpdated: Date
    },

    friends: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      addedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
    }],

    // UI/UX Preferences
    hasCompletedOnboarding: { type: Boolean, default: true },
    dashboardLayout: {
      type: Object,
      default: null // Will store react-grid-layout positions
    },
    keyboardShortcutsEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    hasResume: { type: Boolean, default: false },
    preferences: {
      type: Object,
      default: {
        theme: 'light',
        notifications: true,
        emailUpdates: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
