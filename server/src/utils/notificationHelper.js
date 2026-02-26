/**
 * notificationHelper.js
 * Small utility to push a notification document into any User object
 * without repeating the same boilerplate everywhere.
 *
 * Usage:
 *   const { pushNotification } = require('../utils/notificationHelper');
 *   await pushNotification(userId, {
 *     type: 'achievement',
 *     title: 'Badge Earned!',
 *     message: 'You earned the "Streak Master" badge.',
 *     link: '/achievements',
 *     meta: { badge: 'Streak Master' }
 *   });
 */

const User = require('../models/User');

/**
 * @param {string|ObjectId} userId
 * @param {{ type: string, title: string, message: string, link?: string, meta?: object }} data
 */
async function pushNotification(userId, data) {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                notifications: {
                    $each: [{
                        type: data.type || 'system',
                        title: data.title || 'Notification',
                        message: data.message || '',
                        link: data.link || '',
                        meta: data.meta || {},
                        read: false,
                        createdAt: new Date()
                    }],
                    $slice: -50   // keep newest 50, auto-trim old ones
                }
            }
        });
    } catch (err) {
        console.error('[pushNotification] Failed:', err.message);
    }
}

module.exports = { pushNotification };
