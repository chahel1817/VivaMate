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

    // Generate questions immediately
    console.log(`Generating ${totalQuestions} questions for session: ${sessionId}`);
    const questionsData = await aiController.generateUniqueQuestions({
      type: `${domain} ${tech} ${difficulty}`,
      count: totalQuestions,
      userId: req.user,
    });

    const questionTexts = questionsData.map(q => q.question);

    const session = await InterviewSession.create({
      user: req.user,
      sessionId,
      topic: { domain, tech },
      difficulty,
      totalQuestions,
      questions: questionTexts, // Save generated questions here
      interviewType: `${domain} - ${tech} (${difficulty})`,
      startedAt: new Date(),
    });

    res.json({ sessionId, questions: questionTexts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Session start failed" });
  }
};

exports.createSummary = async (req, res) => {
  const sessionId = req.params.id || req.body.sessionId || req.body._id;
  if (!sessionId) return res.status(400).json({ message: "Missing session id" });

  try {
    let session = null;
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await InterviewSession.findById(sessionId).lean();
    }
    if (!session) session = await InterviewSession.findOne({ sessionId }).lean();
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    const responses = await Response.find({ sessionId: session.sessionId || sessionId })
      .sort({ createdAt: 1 })
      .lean();

    console.log(`Found ${responses.length} responses for session ${sessionId}`);

    // Parallelize evaluations
    const evaluationPromises = responses.map(async (response) => {
      const questionText = String(response.question || "").trim();
      const answerText = String(response.transcript || "").trim();

      if (!questionText) return null;

      let technicalScore = 0;
      let clarityScore = 0;
      let confidenceScore = 0;
      let feedback = response.feedback || "";

      // Check if scores are actually non-zero or if feedback exists (indicating previous evaluation)
      const hasScores = response.scores && (response.scores.technical > 0 || response.scores.clarity > 0 || response.scores.confidence > 0);

      if (hasScores) {
        technicalScore = Number(response.scores.technical) || 0;
        clarityScore = Number(response.scores.clarity) || 0;
        confidenceScore = Number(response.scores.confidence) || 0;
      } else if (answerText && answerText !== "No answer provided.") {
        try {
          const evalRes = await aiController.evaluateAnswer(questionText, answerText);
          technicalScore = evalRes.technicalScore || 0;
          clarityScore = evalRes.clarityScore || 0;
          confidenceScore = evalRes.confidenceScore || 0;
          feedback = evalRes.feedback || feedback;

          // Optionally update the response in DB with these scores
          await Response.findByIdAndUpdate(response._id, {
            $set: {
              scores: { technical: technicalScore, clarity: clarityScore, confidence: confidenceScore },
              feedback: feedback
            }
          });
        } catch (e) {
          console.warn(`Failed to evaluate answer for question: ${questionText.substring(0, 50)}`, e.message);
        }
      }

      return {
        question: questionText,
        answer: answerText,
        technicalScore,
        clarityScore,
        confidenceScore,
        feedback,
        tech: response.tech,
        domain: response.domain
      };
    });

    const perQuestionFeedbackRaw = await Promise.all(evaluationPromises);
    const perQuestionFeedback = perQuestionFeedbackRaw.filter(Boolean);

    let techSum = 0, claritySum = 0, confidenceSum = 0, count = 0;
    const skillMap = new Map();

    for (const item of perQuestionFeedback) {
      techSum += item.technicalScore;
      claritySum += item.clarityScore;
      confidenceSum += item.confidenceScore;
      count++;

      // Skill metrics calculation using evaluated scores
      const skillKey = (item.tech || item.domain || "General").trim();
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, { skill: skillKey, total: 0, count: 0 });
      }
      const entry = skillMap.get(skillKey);
      entry.total += item.technicalScore;
      entry.count += 1;
    }

    const averageTechnical = count > 0 ? Math.round((techSum / count) * 10) / 10 : 0;
    const averageClarity = count > 0 ? Math.round((claritySum / count) * 10) / 10 : 0;
    const averageConfidence = count > 0 ? Math.round((confidenceSum / count) * 10) / 10 : 0;
    const overallScore = Math.round(((averageTechnical + averageClarity + averageConfidence) / 3) * 10) / 10;

    let consistencyScore = null;
    let consistencyNote = null;
    if (count > 1) {
      const scores = perQuestionFeedback.map((p) => Number(p.technicalScore || 0));
      const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
      const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const raw = Math.max(0, 10 - stdDev * 2);
      consistencyScore = Math.round(raw * 10) / 10;

      if (consistencyScore >= 8.5) consistencyNote = "Very consistent performance across questions.";
      else if (consistencyScore >= 7) consistencyNote = "Generally consistent with minor fluctuations.";
      else if (consistencyScore >= 5.5) consistencyNote = "Technically strong but inconsistent under stress.";
      else consistencyNote = "High fluctuation in performance; work on staying steady under pressure.";
    } else {
      consistencyNote = "More questions are needed to accurately measure consistency.";
    }

    let recommendation = "Needs improvement";
    if (overallScore >= 8) recommendation = "Strong hire";
    else if (overallScore >= 6) recommendation = "Consider with reservations";
    else if (overallScore >= 4) recommendation = "Needs improvement";
    else recommendation = "Not recommended";

    const sortedByTech = [...perQuestionFeedback].sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0));
    const strengths = sortedByTech.slice(0, 2).map((p) => p.feedback).filter(Boolean);
    const weaknesses = sortedByTech.slice(-2).reverse().map((p) => p.feedback).filter(Boolean);

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

    let updatedSession = null;
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      updatedSession = await InterviewSession.findByIdAndUpdate(sessionId, { $set: update }, { new: true });
    }
    if (!updatedSession) {
      updatedSession = await InterviewSession.findOneAndUpdate({ sessionId }, { $set: update }, { new: true });
    }

    if (!updatedSession) return res.status(404).json({ message: "Failed to update session summary" });

    return res.status(200).json(updatedSession);
  } catch (err) {
    console.error("createSummary error", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getMySummary = async (req, res) => {
  const session = await InterviewSession.findOne({ user: req.user }).sort({
    createdAt: -1,
  });
  res.json(session);
};
