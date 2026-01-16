const mongoose = require("mongoose");
const InterviewSession = require("../models/InterviewSession");
const Response = require("../models/Response");
const aiController = require("./aiController");

exports.startSession = async (req, res) => {
  try {
    let { domain, tech, difficulty, totalQuestions } = req.body;

    difficulty =
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

    const sessionId = `session_${Date.now()}_${req.user}`;

    const session = await InterviewSession.create({
      user: req.user,
      sessionId,
      topic: { domain, tech },
      difficulty,
      totalQuestions,
      interviewType: `${domain} - ${tech} (${difficulty})`,
      startedAt: new Date(),
    });

    res.json({ sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Session start failed" });
  }
};

exports.createSummary = async (req, res) => {
  // accept id in params or body
  const sessionId = req.params.id || req.body.sessionId || req.body._id;
  if (!sessionId) return res.status(400).json({ message: "Missing session id" });

  try {
    // fetch existing session (by _id or sessionId string)
    let session = null;
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await InterviewSession.findById(sessionId).lean();
    }
    if (!session) session = await InterviewSession.findOne({ sessionId }).lean();
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    // Fetch all responses for this session from Response model
    const responses = await Response.find({ sessionId: session.sessionId || sessionId })
      .sort({ createdAt: 1 })
      .lean();

    console.log(`Found ${responses.length} responses for session ${sessionId}`);

    // Build per-question feedback from responses
    const perQuestionFeedback = [];
    let techSum = 0;
    let claritySum = 0;
    let confidenceSum = 0;
    let count = 0;

    for (const response of responses) {
      const questionText = String(response.question || "").trim();
      const answerText = String(response.transcript || "").trim();
      
      if (!questionText) continue;

      // Use scores from response if available, otherwise evaluate
      let technicalScore = 0;
      let clarityScore = 0;
      let confidenceScore = 0;
      let feedback = response.feedback || "";

      if (response.scores) {
        technicalScore = Number(response.scores.technical) || 0;
        clarityScore = Number(response.scores.clarity) || 0;
        confidenceScore = Number(response.scores.confidence) || 0;
      } else if (answerText) {
        // Fallback: evaluate if scores not available
        try {
          const evalRes = await aiController.evaluateAnswer(questionText, answerText);
          technicalScore = evalRes.technicalScore || 0;
          clarityScore = evalRes.clarityScore || 0;
          confidenceScore = evalRes.confidenceScore || 0;
          feedback = evalRes.feedback || feedback;
        } catch (e) {
          console.warn(`Failed to evaluate answer for question: ${questionText.substring(0, 50)}`, e.message);
        }
      }

      perQuestionFeedback.push({
        question: questionText,
        answer: answerText,
        technicalScore,
        clarityScore,
        confidenceScore,
        feedback,
      });

      techSum += technicalScore;
      claritySum += clarityScore;
      confidenceSum += confidenceScore;
      count++;
    }

    // Calculate averages
    const averageTechnical = count > 0 ? Math.round((techSum / count) * 10) / 10 : 0;
    const averageClarity = count > 0 ? Math.round((claritySum / count) * 10) / 10 : 0;
    const averageConfidence = count > 0 ? Math.round((confidenceSum / count) * 10) / 10 : 0;
    const overallScore = Math.round(((averageTechnical + averageClarity + averageConfidence) / 3) * 10) / 10;

    // Consistency score (based on variance of technical scores)
    let consistencyScore = null;
    let consistencyNote = null;
    if (count > 1) {
      const scores = perQuestionFeedback.map((p) => Number(p.technicalScore || 0));
      const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
      const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const raw = Math.max(0, 10 - stdDev * 2); // higher stdDev => lower consistency
      consistencyScore = Math.round(raw * 10) / 10;

      if (consistencyScore >= 8.5) {
        consistencyNote = "Very consistent performance across questions.";
      } else if (consistencyScore >= 7) {
        consistencyNote = "Generally consistent with minor fluctuations.";
      } else if (consistencyScore >= 5.5) {
        consistencyNote = "Technically strong but inconsistent under stress.";
      } else {
        consistencyNote = "High fluctuation in performance; work on staying steady under pressure.";
      }
    } else {
      consistencyScore = null;
      consistencyNote = "More questions are needed to accurately measure consistency.";
    }

    // Recommendation logic
    let recommendation = null;
    if (overallScore >= 8) recommendation = "Strong hire";
    else if (overallScore >= 6) recommendation = "Consider with reservations";
    else if (overallScore >= 4) recommendation = "Needs improvement";
    else recommendation = "Not recommended";

    // Strengths: top 2 highest technicalScore feedback entries
    const sortedByTech = [...perQuestionFeedback].sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0));
    const strengths = sortedByTech.slice(0, 2)
      .map((p) => p.feedback)
      .filter(Boolean)
      .filter((f, i, arr) => arr.indexOf(f) === i); // Remove duplicates

    // Weaknesses: bottom 2 lowest technicalScore feedback entries
    const weaknesses = sortedByTech.slice(-2)
      .reverse()
      .map((p) => p.feedback)
      .filter(Boolean)
      .filter((f, i, arr) => arr.indexOf(f) === i); // Remove duplicates

    // Skill metrics (by tech/domain)
    const skillMap = new Map();
    for (const r of responses) {
      const skillKey = (r.tech || r.domain || "").trim();
      if (!skillKey) continue;
      const s = r.scores || {};
      const techScore = Number(s.technical || 0);
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, { skill: skillKey, total: 0, count: 0 });
      }
      const entry = skillMap.get(skillKey);
      entry.total += techScore;
      entry.count += 1;
    }

    const skillMetrics = Array.from(skillMap.values())
      .map((e) => ({
        skill: e.skill,
        averageScore: e.count > 0 ? Math.round((e.total / e.count) * 10) / 10 : 0,
        count: e.count,
      }))
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

    const update = {
      overallScore,
      averageTechnical,
      averageClarity,
      averageConfidence,
      consistencyScore,
      consistencyNote,
      recommendation,
      strengths: strengths.length > 0 ? strengths : ["Keep practicing to improve your skills"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Focus on technical fundamentals"],
      perQuestionFeedback,
      skillMetrics,
      endedAt: new Date(),
    };

    // Atomic update by _id or sessionId
    let updatedSession = null;
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      updatedSession = await InterviewSession.findByIdAndUpdate(sessionId, { $set: update }, { new: true, runValidators: true });
    }
    if (!updatedSession) {
      updatedSession = await InterviewSession.findOneAndUpdate({ sessionId }, { $set: update }, { new: true, runValidators: true });
    }
    if (!updatedSession) return res.status(404).json({ message: "Failed to update session summary" });

    console.log(`Summary created for session ${sessionId}: Overall score = ${overallScore}`);

    // Emit socket event if available
    if (global.io) {
      try {
        global.io.emit("session:updated", { id: updatedSession._id, sessionId: updatedSession.sessionId });
      } catch (e) {
        /* ignore emit errors */
      }
    }

    return res.status(200).json(updatedSession);
  } catch (err) {
    console.error("createSummary error", err);
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid id format" });
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getMySummary = async (req, res) => {
  const session = await InterviewSession.findOne({ user: req.user }).sort({
    createdAt: -1,
  });
  res.json(session);
};
