const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit feedback
router.post('/', async (req, res) => {
  console.log('Received feedback request:', req.body); // Add logging
  const feedback = new Feedback({
    interviewId: req.body.interviewId,
    userId: req.body.userId,
    rating: req.body.rating,
    comment: req.body.comment
  });
  try {
    const newFeedback = await feedback.save();
    console.log('Feedback saved:', newFeedback); // Add logging
    res.status(201).json(newFeedback);
  } catch (err) {
    console.error('Error saving feedback:', err); // Add logging
    res.status(400).json({ message: err.message });
  }
});

// Get feedback for an interview
router.get('/:interviewId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ interviewId: req.params.interviewId });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
