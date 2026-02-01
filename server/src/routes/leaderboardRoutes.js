const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const leaderboardService = require('../services/leaderboardService');
const achievementService = require('../services/achievementService');
const User = require('../models/User');

// ==================== LEADERBOARD ROUTES ====================

/**
 * GET /api/leaderboard/global/:type
 * Get global leaderboard (XP or Streak)
 */
router.get('/global/:type', protect, async (req, res) => {
    try {
        const { type } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        if (!['xp', 'streak'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Use "xp" or "streak"' });
        }

        const leaderboard = await leaderboardService.getGlobalLeaderboard(type, limit, offset);

        // Get user's rank
        const userRank = await leaderboardService.getUserRank(req.user, type);
        const userScore = await leaderboardService.getUserScore(req.user, type);

        res.json({
            leaderboard,
            userStats: {
                rank: userRank,
                score: userScore,
                type: type
            },
            pagination: {
                limit,
                offset,
                hasMore: leaderboard.length === limit
            }
        });
    } catch (err) {
        console.error('Error getting global leaderboard:', err);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
});

/**
 * GET /api/leaderboard/weekly/current
 * Get current week's leaderboard
 */
router.get('/weekly/current', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        const leaderboard = await leaderboardService.getWeeklyLeaderboard(null, limit);
        const weekNumber = leaderboardService.getCurrentWeekNumber();

        res.json({
            leaderboard,
            week: weekNumber,
            pagination: {
                limit,
                hasMore: leaderboard.length === limit
            }
        });
    } catch (err) {
        console.error('Error getting weekly leaderboard:', err);
        res.status(500).json({ message: 'Failed to get weekly leaderboard' });
    }
});

/**
 * GET /api/leaderboard/weekly/:weekNumber
 * Get specific week's leaderboard
 */
router.get('/weekly/:weekNumber', protect, async (req, res) => {
    try {
        const { weekNumber } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const leaderboard = await leaderboardService.getWeeklyLeaderboard(weekNumber, limit);

        res.json({
            leaderboard,
            week: weekNumber,
            pagination: {
                limit,
                hasMore: leaderboard.length === limit
            }
        });
    } catch (err) {
        console.error('Error getting weekly leaderboard:', err);
        res.status(500).json({ message: 'Failed to get weekly leaderboard' });
    }
});

/**
 * GET /api/leaderboard/user/:userId/rank
 * Get user's rank in all leaderboards
 */
router.get('/user/:userId/rank', protect, async (req, res) => {
    try {
        const { userId } = req.params;

        const xpRank = await leaderboardService.getUserRank(userId, 'xp');
        const streakRank = await leaderboardService.getUserRank(userId, 'streak');
        const xpScore = await leaderboardService.getUserScore(userId, 'xp');
        const streakScore = await leaderboardService.getUserScore(userId, 'streak');

        res.json({
            xp: {
                rank: xpRank,
                score: xpScore
            },
            streak: {
                rank: streakRank,
                score: streakScore
            }
        });
    } catch (err) {
        console.error('Error getting user rank:', err);
        res.status(500).json({ message: 'Failed to get user rank' });
    }
});

/**
 * GET /api/leaderboard/user/:userId/context
 * Get users around a specific user
 */
router.get('/user/:userId/context', protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const type = req.query.type || 'xp';
        const range = parseInt(req.query.range) || 5;

        const context = await leaderboardService.getLeaderboardContext(userId, type, range);

        res.json({
            context,
            type,
            range
        });
    } catch (err) {
        console.error('Error getting leaderboard context:', err);
        res.status(500).json({ message: 'Failed to get leaderboard context' });
    }
});

// ==================== ACHIEVEMENT ROUTES ====================

/**
 * GET /api/leaderboard/achievements
 * Get all achievement definitions
 */
router.get('/achievements', protect, async (req, res) => {
    try {
        const category = req.query.category;

        let achievements;
        if (category) {
            achievements = achievementService.getAchievementsByCategory(category);
        } else {
            achievements = achievementService.getAllAchievements();
        }

        res.json({ achievements });
    } catch (err) {
        console.error('Error getting achievements:', err);
        res.status(500).json({ message: 'Failed to get achievements' });
    }
});

/**
 * GET /api/leaderboard/achievements/user/:userId
 * Get user's achievements with progress
 */
router.get('/achievements/user/:userId', protect, async (req, res) => {
    try {
        const { userId } = req.params;

        const achievements = await achievementService.getUserAchievements(userId);

        const stats = {
            total: achievements.length,
            unlocked: achievements.filter(a => a.unlocked).length,
            locked: achievements.filter(a => !a.unlocked).length,
            byCategory: {}
        };

        // Count by category
        for (const achievement of achievements) {
            if (!stats.byCategory[achievement.category]) {
                stats.byCategory[achievement.category] = { total: 0, unlocked: 0 };
            }
            stats.byCategory[achievement.category].total++;
            if (achievement.unlocked) {
                stats.byCategory[achievement.category].unlocked++;
            }
        }

        res.json({
            achievements,
            stats
        });
    } catch (err) {
        console.error('Error getting user achievements:', err);
        res.status(500).json({ message: 'Failed to get user achievements' });
    }
});

/**
 * POST /api/leaderboard/achievements/check
 * Manually trigger achievement check for current user
 */
router.post('/achievements/check', protect, async (req, res) => {
    try {
        const newAchievements = await achievementService.checkAchievements(req.user);

        res.json({
            success: true,
            newAchievements,
            count: newAchievements.length
        });
    } catch (err) {
        console.error('Error checking achievements:', err);
        res.status(500).json({ message: 'Failed to check achievements' });
    }
});

// ==================== FRIENDS ROUTES ====================

/**
 * GET /api/leaderboard/friends
 * Get user's friends list
 */
router.get('/friends', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user).populate('friends.userId', 'name email profilePic xp streak level badges');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friends = user.friends.map(f => ({
            userId: f.userId._id,
            name: f.userId.name,
            email: f.userId.email,
            profilePic: f.userId.profilePic,
            xp: f.userId.xp,
            streak: f.userId.streak,
            level: f.userId.level,
            badges: f.userId.badges,
            status: f.status,
            addedAt: f.addedAt
        }));

        res.json({ friends });
    } catch (err) {
        console.error('Error getting friends:', err);
        res.status(500).json({ message: 'Failed to get friends' });
    }
});

/**
 * POST /api/leaderboard/friends/add
 * Send friend request
 */
router.post('/friends/add', protect, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find friend by email
        const friend = await User.findOne({ email });

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (friend._id.toString() === req.user.toString()) {
            return res.status(400).json({ message: 'Cannot add yourself as friend' });
        }

        // Check if already friends
        const user = await User.findById(req.user);
        const alreadyFriends = user.friends.some(f => f.userId.toString() === friend._id.toString());

        if (alreadyFriends) {
            return res.status(400).json({ message: 'Already friends or request pending' });
        }

        // Add friend request
        user.friends.push({
            userId: friend._id,
            status: 'pending'
        });

        await user.save();

        res.json({
            success: true,
            message: 'Friend request sent',
            friend: {
                userId: friend._id,
                name: friend.name,
                email: friend.email,
                profilePic: friend.profilePic
            }
        });
    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ message: 'Failed to add friend' });
    }
});

/**
 * POST /api/leaderboard/friends/accept/:friendId
 * Accept friend request
 */
router.post('/friends/accept/:friendId', protect, async (req, res) => {
    try {
        const { friendId } = req.params;

        const user = await User.findById(req.user);
        const friend = user.friends.find(f => f.userId.toString() === friendId && f.status === 'pending');

        if (!friend) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        friend.status = 'accepted';
        await user.save();

        res.json({
            success: true,
            message: 'Friend request accepted'
        });
    } catch (err) {
        console.error('Error accepting friend:', err);
        res.status(500).json({ message: 'Failed to accept friend' });
    }
});

/**
 * DELETE /api/leaderboard/friends/remove/:friendId
 * Remove friend
 */
router.delete('/friends/remove/:friendId', protect, async (req, res) => {
    try {
        const { friendId } = req.params;

        const user = await User.findById(req.user);
        user.friends = user.friends.filter(f => f.userId.toString() !== friendId);

        await user.save();

        res.json({
            success: true,
            message: 'Friend removed'
        });
    } catch (err) {
        console.error('Error removing friend:', err);
        res.status(500).json({ message: 'Failed to remove friend' });
    }
});

/**
 * GET /api/leaderboard/friends/leaderboard
 * Get leaderboard of friends only
 */
router.get('/friends/leaderboard', protect, async (req, res) => {
    try {
        const type = req.query.type || 'xp';

        const user = await User.findById(req.user).populate('friends.userId', 'name email profilePic xp streak level badges');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get accepted friends only
        const acceptedFriends = user.friends
            .filter(f => f.status === 'accepted')
            .map(f => f.userId);

        // Add current user
        const currentUser = await User.findById(req.user).select('name email profilePic xp streak level badges');
        const allUsers = [currentUser, ...acceptedFriends];

        // Sort by type
        const sortField = type === 'xp' ? 'xp' : 'streak';
        allUsers.sort((a, b) => b[sortField] - a[sortField]);

        const leaderboard = allUsers.map((u, index) => ({
            rank: index + 1,
            userId: u._id,
            name: u.name,
            email: u.email,
            profilePic: u.profilePic,
            xp: u.xp,
            streak: u.streak,
            level: u.level,
            badges: u.badges,
            score: type === 'xp' ? u.xp : u.streak,
            isCurrentUser: u._id.toString() === req.user.toString()
        }));

        res.json({ leaderboard, type });
    } catch (err) {
        console.error('Error getting friends leaderboard:', err);
        res.status(500).json({ message: 'Failed to get friends leaderboard' });
    }
});

// ==================== ADMIN/UTILITY ROUTES ====================

/**
 * POST /api/leaderboard/sync
 * Sync all users to Redis (admin only)
 */
router.post('/sync', protect, async (req, res) => {
    try {
        const count = await leaderboardService.syncAllUsersToRedis();

        res.json({
            success: true,
            message: `Synced ${count} users to Redis`,
            count
        });
    } catch (err) {
        console.error('Error syncing users:', err);
        res.status(500).json({ message: 'Failed to sync users' });
    }
});

/**
 * GET /api/leaderboard/health
 * Check Redis connection status
 */
router.get('/health', async (req, res) => {
    try {
        const { redis, isRedisAvailable } = require('../config/redis');
        const redisConnected = await isRedisAvailable();

        res.json({
            redis: {
                connected: redisConnected,
                status: redisConnected ? 'Connected ✅' : 'Disconnected ❌',
                message: redisConnected
                    ? 'Redis is working! Leaderboards will be fast 🚀'
                    : 'Redis not available. Using MongoDB fallback (slower)'
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            redis: {
                connected: false,
                status: 'Error ❌',
                message: err.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
