const Response = require("../models/Response");

exports.saveResponse = async (req, res) => {
  try {
    const { question, transcript, feedback, scores, interviewType } = req.body;

    const response = await Response.create({
      user: req.user,
      question,
      transcript,
      feedback,
      scores,
      interviewType,
    });

    res.status(201).json({
      message: "Response saved successfully",
      response,
    });
  } catch (error) {
    console.error("SAVE RESPONSE ERROR:", error);
    res.status(500).json({ message: "Failed to save response" });
  }
}

exports.getMyResponses = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user })
      .sort({ createdAt: -1 });

    res.json(responses);
  } catch (error) {
    console.error("FETCH RESPONSES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch responses" });
  }
};
