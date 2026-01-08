const express = require('express');
const protect = require('../middleware/authMiddleware');
const Interview = require('../models/Interview');
const Response = require('../models/Response');

const router = express.Router();

// Create a new interview
router.post('/', protect, async (req, res) => {
  try {
    const { type } = req.body;
    const interview = new Interview({ user: req.user, type });
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's interviews
router.get('/', protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific interview
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit response
router.post('/:id/response', protect, async (req, res) => {
  try {
    const { question, answer, score } = req.body;
    const response = new Response({
      user: req.user,
      interview: req.params.id,
      question,
      answer,
      score
    });
    await response.save();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get responses for an interview
router.get('/:id/responses', protect, async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user, interview: req.params.id });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
