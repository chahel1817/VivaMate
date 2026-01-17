const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const protect = require('../src/middleware/authMiddleware');

// Get all messages for the current user (received)
router.get('/', protect, async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user })
            .sort({ createdAt: -1 })
            .populate('sender', 'username email');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send a message
router.post('/', protect, async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        // Simple validation
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const message = new Message({
            sender: req.user,
            recipient: recipientId || null, // Can be null for general/feedback messages if intended
            content
        });

        const newMessage = await message.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Mark as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const message = await Message.findOne({ _id: req.params.id, recipient: req.user });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.read = true;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
