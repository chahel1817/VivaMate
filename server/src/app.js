const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const aiRoutes = require("./routes/aiRoutes");
const app = express();
const protect = require("./middleware/authMiddleware");
const responseRoutes = require("./routes/responseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const interviewSessionRoutes = require("./routes/interviewSessionRoutes");
const forumRoutes = require("../routes/forum");
const feedbackRoutes = require("../routes/feedback");
const messageRoutes = require("../routes/message");
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/interview", interviewSessionRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/dashboard", protect, async (req, res) => {
  try {
    const InterviewSession = require("./models/InterviewSession");

    // Fetch all interview sessions for the user
    const sessions = await InterviewSession
      .find({ user: req.user })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average score from completed sessions
    const completedSessions = sessions.filter(s => s.overallScore !== null && s.overallScore !== undefined);
    const avgScore = completedSessions.length > 0
      ? Math.round((completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length) * 10)
      : 0;

    // Get last interview date
    const lastInterview = sessions.length > 0
      ? new Date(sessions[0].createdAt).toLocaleDateString()
      : null;

    // Recent activity from sessions
    const recentActivity = sessions.slice(0, 5).map((s) => ({
      role: s.topic ? `${s.topic.domain || ''} ${s.topic.tech || ''}`.trim() || "Mock Interview" : "Mock Interview",
      date: new Date(s.createdAt).toLocaleDateString(),
      score: s.overallScore ? `${s.overallScore}/10` : "In Progress",
    }));

    res.json({
      message: "Welcome to dashboard",
      userId: req.user,
      interviewsTaken: sessions.length,
      averageScore: avgScore, // Percentage format (0-100)
      lastInterview,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard stats endpoint (for compatibility)
app.get("/api/dashboard/stats", protect, async (req, res) => {
  try {
    const InterviewSession = require("./models/InterviewSession");

    const sessions = await InterviewSession
      .find({ user: req.user })
      .sort({ createdAt: -1 })
      .lean();

    const completedSessions = sessions.filter(s => s.overallScore !== null && s.overallScore !== undefined);

    let avgScore = 0;
    let skillBreakdown = {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      behavioral: 0
    };

    if (completedSessions.length > 0) {
      avgScore = Math.round((completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length) * 10);

      const total = completedSessions.length;
      skillBreakdown.technical = completedSessions.reduce((sum, s) => sum + (s.averageTechnical || 0), 0) / total;
      skillBreakdown.communication = completedSessions.reduce((sum, s) => sum + (s.averageClarity || 0), 0) / total;
      skillBreakdown.behavioral = completedSessions.reduce((sum, s) => sum + (s.averageConfidence || 0), 0) / total;
      skillBreakdown.problemSolving = (skillBreakdown.technical + skillBreakdown.communication) / 2; // Derived
    }

    const performanceTrend = completedSessions
      .slice(0, 20) // Limit to last 20 for chart
      .reverse() // Oldest first for trend line
      .map(s => ({
        date: s.createdAt,
        score: s.overallScore || 0
      }));

    res.json({
      interviewsTaken: completedSessions.length, // Only count completed interviews
      averageScore: avgScore,
      lastInterview: completedSessions.length > 0 ? new Date(completedSessions[0].createdAt).toLocaleDateString() : null,
      recentActivity: completedSessions.slice(0, 5).map((s) => ({ // Only show completed interviews
        role: s.topic ? `${s.topic.domain || ''} ${s.topic.tech || ''}`.trim() || "Mock Interview" : "Mock Interview",
        date: new Date(s.createdAt).toLocaleDateString(),
        score: `${s.overallScore}/10`, // Always show score for completed sessions
        type: s.topic ? s.topic.domain : "Interview",
        duration: 45 // Placeholder as duration might not be stored directly
      })),
      skillBreakdown,
      performanceTrend
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

module.exports = app;
