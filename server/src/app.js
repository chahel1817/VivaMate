const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const aiRoutes = require("./routes/aiRoutes");
const app = express();
const protect = require("./middleware/authMiddleware");
const responseRoutes = require("./routes/responseRoutes");


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/responses", responseRoutes);

app.get("/api/dashboard", protect, async (req, res) => {
  try {
    const Interview = require("./models/Interview");
    const Response = require("./models/Response");

    const interviews = await Interview
      .find({ user: req.user })
      .sort({ createdAt: -1 });

    const responses = await Response.find({ user: req.user });

    const avgTechnicalScore =
      responses.length > 0
        ? responses.reduce(
            (sum, r) => sum + (r.evaluation?.technicalScore || 0),
            0
          ) / responses.length
        : 0;

    res.json({
      message: "Welcome to dashboard",
      userId: req.user,
      interviewsTaken: interviews.length,
      averageScore: Math.round(avgTechnicalScore * 10), // % format
      lastInterview: interviews[0]
        ? new Date(interviews[0].createdAt).toLocaleDateString()
        : null,
      recentActivity: interviews.slice(0, 3).map((i) => ({
        role: i.role || "Mock Interview",
        date: new Date(i.createdAt).toLocaleDateString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("API running...");
});

module.exports = app;
