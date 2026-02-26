const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

/**
 * GET /api/notifications
 * Returns the latest 30 notifications for the logged-in user, newest first.
 */
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('notifications');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return newest first, cap at 30
        const notifications = [...(user.notifications || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 30);

        const unreadCount = user.notifications.filter(n => !n.read).length;

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

/**
 * POST /api/notifications/read/:id
 * Mark a single notification as read.
 */
router.post('/read/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const notif = user.notifications.id(req.params.id);
        if (notif) {
            notif.read = true;
            await user.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking notification read:', err);
        res.status(500).json({ message: 'Failed to update notification' });
    }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read.
 */
router.post('/read-all', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user, {
            $set: { 'notifications.$[].read': true }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Error marking all notifications read:', err);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification.
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user, {
            $pull: { notifications: { _id: req.params.id } }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

/**
 * DELETE /api/notifications
 * Clear all notifications.
 */
router.delete('/', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user, { $set: { notifications: [] } });
        res.json({ success: true });
    } catch (err) {
        console.error('Error clearing notifications:', err);
        res.status(500).json({ message: 'Failed to clear notifications' });
    }
});

module.exports = router;
