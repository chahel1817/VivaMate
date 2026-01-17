const express = require('express');
const router = express.Router();
const Interview = require('../src/models/Interview');
const Response = require('../src/models/Response');
const protect = require('../src/middleware/authMiddleware');

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user;

    // Get user's interviews
    const interviews = await Interview.find({ user: userId }).sort({ createdAt: -1 });
    const interviewsTaken = interviews.length;

    // Calculate average score
    const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
    const averageScore = interviewsTaken > 0 ? totalScore / interviewsTaken : 0;

    // Get recent activity (last 10 interviews)
    const recentActivity = interviews.slice(0, 10).map(interview => ({
      id: interview._id,
      type: interview.role || 'Mock Interview',
      score: interview.score || 0,
      date: interview.createdAt,
      duration: 45 // Placeholder, you might want to add duration to Interview model
    }));

    // Calculate skill breakdown from responses
    const responses = await Response.find({ user: userId });
    let skillBreakdown = {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      behavioral: 0
    };

    if (responses.length > 0) {
      const totalResponses = responses.length;
      skillBreakdown.technical = responses.reduce((sum, r) => sum + (r.scores.technical || 0), 0) / totalResponses;
      skillBreakdown.communication = responses.reduce((sum, r) => sum + (r.scores.clarity || 0), 0) / totalResponses;
      skillBreakdown.behavioral = responses.reduce((sum, r) => sum + (r.scores.confidence || 0), 0) / totalResponses;
      // For problem solving, we can use a combination or add a field later
      skillBreakdown.problemSolving = (skillBreakdown.technical + skillBreakdown.communication) / 2;
    }

    res.json({
      interviewsTaken,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      skillBreakdown,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
