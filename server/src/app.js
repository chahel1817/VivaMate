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
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/interview", interviewSessionRoutes);

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

    let avgScore = null;
    if (completedSessions.length > 0) {
      avgScore = Math.round((completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length) * 10);
    } else {
      avgScore = 0;
    }

    res.json({
      interviewsTaken: sessions.length,
      averageScore: avgScore,
      lastInterview: sessions.length > 0 ? new Date(sessions[0].createdAt).toLocaleDateString() : null,
      recentActivity: sessions.slice(0, 5).map((s) => ({
        role: s.topic ? `${s.topic.domain || ''} ${s.topic.tech || ''}`.trim() || "Mock Interview" : "Mock Interview",
        date: new Date(s.createdAt).toLocaleDateString(),
        score: s.overallScore ? `${s.overallScore}/10` : "In Progress",
      })),
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
