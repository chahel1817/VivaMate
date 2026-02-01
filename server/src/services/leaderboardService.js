const { redis, isRedisAvailable } = require('../config/redis');
const User = require('../models/User');

/**
 * Leaderboard Service
 * Handles all leaderboard operations with Redis for speed
 * Falls back to MongoDB if Redis is unavailable
 */

// Leaderboard keys
const KEYS = {
    GLOBAL_XP: 'leaderboard:global:xp',
    GLOBAL_STREAK: 'leaderboard:global:streak',
    WEEKLY: (week) => `leaderboard:weekly:${week}`,
    MONTHLY: (month) => `leaderboard:monthly:${month}`,
    USER_CACHE: (userId) => `user:${userId}:cache`
};

// In-memory cache for fallback speed
const memoryCache = {
    global_xp: { data: null, expiry: 0 },
    global_streak: { data: null, expiry: 0 }
};

/**
 * Update user's score in all relevant leaderboards
 */
async function updateUserScore(userId, xp, streak, weeklyXP = 0) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        console.log('Redis unavailable, skipping leaderboard update');
        return;
    }

    try {
        const pipeline = redis.pipeline();

        // Update global XP leaderboard
        pipeline.zadd(KEYS.GLOBAL_XP, xp, userId.toString());

        // Update global streak leaderboard
        pipeline.zadd(KEYS.GLOBAL_STREAK, streak, userId.toString());

        // Update weekly leaderboard
        const weekNumber = getCurrentWeekNumber();
        pipeline.zadd(KEYS.WEEKLY(weekNumber), weeklyXP, userId.toString());
        pipeline.expire(KEYS.WEEKLY(weekNumber), 30 * 24 * 60 * 60); // 30 days

        // Update monthly leaderboard
        const monthKey = getCurrentMonthKey();
        pipeline.zadd(KEYS.MONTHLY(monthKey), xp, userId.toString());
        pipeline.expire(KEYS.MONTHLY(monthKey), 90 * 24 * 60 * 60); // 90 days

        await pipeline.exec();

        console.log(`✅ Updated leaderboard for user ${userId}`);
    } catch (err) {
        console.error('Error updating leaderboard:', err);
    }
}

/**
 * Get global leaderboard (top users)
 */
async function getGlobalLeaderboard(type = 'xp', limit = 100, offset = 0) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        // Fallback to MongoDB
        // Check memory cache first
        const cacheKey = type === 'xp' ? 'global_xp' : 'global_streak';
        const now = Date.now();
        if (memoryCache[cacheKey].data && memoryCache[cacheKey].expiry > now && offset === 0 && limit <= 100) {
            return memoryCache[cacheKey].data; // Return cached top 100
        }

        const data = await getLeaderboardFromMongoDB(type, limit, offset);

        // Cache if fetching page 1
        if (offset === 0) {
            memoryCache[cacheKey] = {
                data: data,
                expiry: now + 60000 // 60 seconds
            };
        }
        return data;
    }

    try {
        const key = type === 'xp' ? KEYS.GLOBAL_XP : KEYS.GLOBAL_STREAK;
        const results = await redis.zrevrange(
            key,
            offset,
            offset + limit - 1,
            'WITHSCORES'
        );

        // Convert to array of objects
        const leaderboard = [];
        for (let i = 0; i < results.length; i += 2) {
            const userId = results[i];
            const score = parseInt(results[i + 1]);

            // Get user details from MongoDB
            const user = await User.findById(userId).select('name email profilePic level badges');

            if (user) {
                leaderboard.push({
                    rank: offset + (i / 2) + 1,
                    userId: userId,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    level: user.level,
                    badges: user.badges,
                    score: score,
                    scoreType: type
                });
            }
        }

        return leaderboard;
    } catch (err) {
        console.error('Error getting leaderboard:', err);
        return getLeaderboardFromMongoDB(type, limit, offset);
    }
}

/**
 * Get weekly leaderboard
 */
async function getWeeklyLeaderboard(weekNumber = null, limit = 100) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        return [];
    }

    try {
        const week = weekNumber || getCurrentWeekNumber();
        const key = KEYS.WEEKLY(week);

        const results = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

        const leaderboard = [];
        for (let i = 0; i < results.length; i += 2) {
            const userId = results[i];
            const score = parseInt(results[i + 1]);

            const user = await User.findById(userId).select('name email profilePic level badges');

            if (user) {
                leaderboard.push({
                    rank: (i / 2) + 1,
                    userId: userId,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    level: user.level,
                    badges: user.badges,
                    weeklyXP: score,
                    week: week
                });
            }
        }

        return leaderboard;
    } catch (err) {
        console.error('Error getting weekly leaderboard:', err);
        return [];
    }
}

/**
 * Get user's rank in leaderboard
 */
async function getUserRank(userId, type = 'xp') {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        return getUserRankFromMongoDB(userId, type);
    }

    try {
        const key = type === 'xp' ? KEYS.GLOBAL_XP : KEYS.GLOBAL_STREAK;
        const rank = await redis.zrevrank(key, userId.toString());

        if (rank === null) {
            return null;
        }

        return rank + 1; // Convert from 0-indexed to 1-indexed
    } catch (err) {
        console.error('Error getting user rank:', err);
        return getUserRankFromMongoDB(userId, type);
    }
}

/**
 * Get user's score
 */
async function getUserScore(userId, type = 'xp') {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        const user = await User.findById(userId);
        return type === 'xp' ? user?.xp || 0 : user?.streak || 0;
    }

    try {
        const key = type === 'xp' ? KEYS.GLOBAL_XP : KEYS.GLOBAL_STREAK;
        const score = await redis.zscore(key, userId.toString());

        return score ? parseInt(score) : 0;
    } catch (err) {
        console.error('Error getting user score:', err);
        const user = await User.findById(userId);
        return type === 'xp' ? user?.xp || 0 : user?.streak || 0;
    }
}

/**
 * Get leaderboard context (users around a specific user)
 */
async function getLeaderboardContext(userId, type = 'xp', range = 5) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        return [];
    }

    try {
        const key = type === 'xp' ? KEYS.GLOBAL_XP : KEYS.GLOBAL_STREAK;
        const userRank = await redis.zrevrank(key, userId.toString());

        if (userRank === null) {
            return [];
        }

        const start = Math.max(0, userRank - range);
        const end = userRank + range;

        const results = await redis.zrevrange(key, start, end, 'WITHSCORES');

        const context = [];
        for (let i = 0; i < results.length; i += 2) {
            const uid = results[i];
            const score = parseInt(results[i + 1]);

            const user = await User.findById(uid).select('name email profilePic level badges');

            if (user) {
                context.push({
                    rank: start + (i / 2) + 1,
                    userId: uid,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    level: user.level,
                    badges: user.badges,
                    score: score,
                    isCurrentUser: uid === userId.toString()
                });
            }
        }

        return context;
    } catch (err) {
        console.error('Error getting leaderboard context:', err);
        return [];
    }
}

/**
 * Sync single user to Redis
 */
async function syncUserToRedis(userId) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        return;
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.error(`User ${userId} not found`);
            return;
        }

        await updateUserScore(
            user._id,
            user.xp || 0,
            user.streak || 0,
            user.weeklyStats?.weeklyXP || 0
        );

        console.log(`✅ Synced user ${userId} to Redis`);
    } catch (err) {
        console.error('Error syncing user to Redis:', err);
    }
}

/**
 * Sync all users to Redis (migration script)
 */
async function syncAllUsersToRedis() {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        console.error('Redis not available, cannot sync users');
        return;
    }

    try {
        console.log('🔄 Starting full user sync to Redis...');

        const users = await User.find({}).select('_id xp streak weeklyStats');
        const pipeline = redis.pipeline();

        for (const user of users) {
            pipeline.zadd(KEYS.GLOBAL_XP, user.xp || 0, user._id.toString());
            pipeline.zadd(KEYS.GLOBAL_STREAK, user.streak || 0, user._id.toString());

            if (user.weeklyStats?.weeklyXP) {
                const weekNumber = getCurrentWeekNumber();
                pipeline.zadd(KEYS.WEEKLY(weekNumber), user.weeklyStats.weeklyXP, user._id.toString());
            }
        }

        await pipeline.exec();

        console.log(`✅ Synced ${users.length} users to Redis`);
        return users.length;
    } catch (err) {
        console.error('Error syncing all users to Redis:', err);
        throw err;
    }
}

/**
 * Remove user from leaderboards
 */
async function removeUserFromLeaderboards(userId) {
    const useRedis = await isRedisAvailable();

    if (!useRedis) {
        return;
    }

    try {
        const pipeline = redis.pipeline();

        pipeline.zrem(KEYS.GLOBAL_XP, userId.toString());
        pipeline.zrem(KEYS.GLOBAL_STREAK, userId.toString());

        await pipeline.exec();

        console.log(`✅ Removed user ${userId} from leaderboards`);
    } catch (err) {
        console.error('Error removing user from leaderboards:', err);
    }
}

// ==================== MONGODB FALLBACK FUNCTIONS ====================

/**
 * Get leaderboard from MongoDB (fallback)
 */
async function getLeaderboardFromMongoDB(type, limit, offset) {
    try {
        const sortField = type === 'xp' ? 'xp' : 'streak';

        const users = await User.find({})
            .select('name email profilePic level badges xp streak')
            .sort({ [sortField]: -1 })
            .skip(offset)
            .limit(limit);

        return users.map((user, index) => ({
            rank: offset + index + 1,
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            level: user.level,
            badges: user.badges,
            score: type === 'xp' ? user.xp : user.streak,
            scoreType: type
        }));
    } catch (err) {
        console.error('Error getting leaderboard from MongoDB:', err);
        return [];
    }
}

/**
 * Get user rank from MongoDB (fallback)
 */
async function getUserRankFromMongoDB(userId, type) {
    try {
        const sortField = type === 'xp' ? 'xp' : 'streak';
        const user = await User.findById(userId);

        if (!user) {
            return null;
        }

        const rank = await User.countDocuments({
            [sortField]: { $gt: user[sortField] }
        });

        return rank + 1;
    } catch (err) {
        console.error('Error getting user rank from MongoDB:', err);
        return null;
    }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get current ISO week number (YYYY-WW format)
 */
function getCurrentWeekNumber() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Get current month key (YYYY-MM format)
 */
function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = {
    updateUserScore,
    getGlobalLeaderboard,
    getWeeklyLeaderboard,
    getUserRank,
    getUserScore,
    getLeaderboardContext,
    syncUserToRedis,
    syncAllUsersToRedis,
    removeUserFromLeaderboards,
    getCurrentWeekNumber,
    getCurrentMonthKey
};
