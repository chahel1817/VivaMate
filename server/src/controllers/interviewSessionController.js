const InterviewSession = require("../models/InterviewSession");
const Response = require("../models/Response");
const { generateAISummary } = require("./aiController");

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
  try {
    const { sessionId } = req.body;

    const session = await InterviewSession.findOne({ sessionId, user: req.user });
    const responses = await Response.find({ sessionId, user: req.user });

    const summary = await generateAISummary(
      responses,
      session.topic,
      session.difficulty
    );

    Object.assign(session, summary, { endedAt: new Date() });
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Summary failed" });
  }
};

exports.getMySummary = async (req, res) => {
  const session = await InterviewSession.findOne({ user: req.user }).sort({
    createdAt: -1,
  });
  res.json(session);
};
