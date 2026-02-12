const User = require('../models/User');
const leaderboardService = require('./leaderboardService');

/**
 * Validates a user's streak and resets it to 0 if they've missed a day.
 * This should be called whenever user profile/data is fetched.
 * 
 * @param {Object} user - The mongoose user document
 * @returns {Promise<Object>} - The updated user document
 */
async function validateAndFixStreak(user) {
    if (!user || !user.lastChallengeDate || user.streak === 0) {
        return user;
    }

    const now = new Date();
    // Normalize today to start of day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Normalize last challenge date to start of day
    const lastDate = new Date(user.lastChallengeDate);
    const lastChallengeStartOfDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

    const diffMs = today.getTime() - lastChallengeStartOfDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // If diffDays is 0: it's today (streak OK)
    // If diffDays is 1: it was yesterday (streak OK, today is the 'grace' day)
    // If diffDays >= 2: they missed at least one full calendar day (streak broken)
    if (diffDays >= 2) {
        console.log(`[StreakService] Resetting streak for user ${user._id}. Last challenge: ${user.lastChallengeDate.toISOString()}, Diff Days: ${diffDays}`);

        // Use updateOne to avoid fetching/saving the entire document (safer with select fields)
        await User.updateOne({ _id: user._id }, { $set: { streak: 0 } });

        // Also update the local object so the response is correct
        user.streak = 0;

        // Sync with Redis if available
        try {
            await leaderboardService.updateUserScore(user._id, user.xp, 0, user.weeklyStats?.weeklyXP || 0);
        } catch (err) {
            console.error('[StreakService] Redis update failed:', err);
        }
    }

    return user;
}

module.exports = {
    validateAndFixStreak
};
