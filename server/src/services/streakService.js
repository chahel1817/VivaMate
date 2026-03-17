const User = require('../models/User');
const ChallengeCompletion = require('../models/ChallengeCompletion');
const leaderboardService = require('./leaderboardService');

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;
const IST_OFFSET_MINUTES = 330;

function getLocalDayNumber(date, tzOffsetMinutes = IST_OFFSET_MINUTES) {
    const d = new Date(date);
    // Add offset so UTC methods return values for the target timezone
    const shifted = new Date(d.getTime() + tzOffsetMinutes * MS_PER_MINUTE);
    return Math.floor(shifted.getTime() / MS_PER_DAY);
}

function getDayKey(date, tzOffsetMinutes = IST_OFFSET_MINUTES) {
    const d = new Date(date);
    const shifted = new Date(d.getTime() + tzOffsetMinutes * MS_PER_MINUTE);
    return shifted.toISOString().split('T')[0];
}

function dayNumberToKey(dayNumber, tzOffsetMinutes = IST_OFFSET_MINUTES) {
    // dayNumber is ms since epoch / MS_PER_DAY
    const shifted = new Date(dayNumber * MS_PER_DAY);
    return shifted.toISOString().split('T')[0];
}

function dayNumberFromKey(dayKey) {
    const d = new Date(dayKey + 'T00:00:00Z');
    return Math.floor(d.getTime() / MS_PER_DAY);
}

function parseDateOrNow(value) {
    if (!value) return new Date();
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date() : d;
}


/**
 * Updates a user's streak based on new activity (Challenge or Interview).
 * 
 * @param {Object} user - The mongoose user document
 * @param {Object} [options]
 * @param {Date|string} [options.activityDate] - Activity timestamp
 * @param {string} [options.type] - "challenge" or "interview"
 * @param {Object} [options.metadata] - score, total, xpEarned etc
 * @returns {Promise<Object>} - Object with { streakIncremented, currentStreak, streakBonus }
 */
async function updateStreakFromActivity(user, options = {}) {
    const activityDate = parseDateOrNow(options.activityDate);
    const dayKey = getDayKey(activityDate, IST_OFFSET_MINUTES);
    const type = options.type || "challenge";
    const { score = 0, total = 0, xpEarned = 0, challengeId = null, interviewId = null } = options.metadata || {};

    // 1. Check if this is the FIRST activity of the day (for streak bonus)
    const alreadyDoneToday = await ChallengeCompletion.exists({ user: user._id, dayKey });

    // 2. Record the activity (Unique per type+ID per day to avoid duplicates if re-submitted)
    const filter = { user: user._id, dayKey, type };
    if (challengeId) filter.challengeId = challengeId;
    if (interviewId) filter.interviewId = interviewId;

    await ChallengeCompletion.updateOne(
        filter,
        {
            $setOnInsert: {
                user: user._id,
                type,
                challengeId,
                interviewId,
                date: activityDate,
                dayKey,
                score,
                total,
                xpEarned
            }
        },
        { upsert: true }
    );

    // 3. Calculate streak by looking backwards through UNIQUE days in completions
    const completions = await ChallengeCompletion.find({ user: user._id })
        .select("dayKey")
        .sort({ dayKey: -1 })
        .limit(500)
        .lean();

    const daySet = new Set(completions.map((c) => c.dayKey));
    daySet.add(dayKey);

    const todayNumber = getLocalDayNumber(activityDate, IST_OFFSET_MINUTES);
    let streak = 0;
    for (let n = todayNumber; daySet.has(dayNumberToKey(n, IST_OFFSET_MINUTES)); n -= 1) {
        streak += 1;
    }

    // 4. Update user record
    user.streak = streak;
    // Only block daily challenge reuse for actual challenge completions
    if (type === "challenge") {
        user.lastChallengeDate = activityDate;
    }

    // Streak bonus only on the FIRST activity of the day
    const streakBonus = alreadyDoneToday ? 0 : user.streak * 10;

    return { streakIncremented: !alreadyDoneToday, currentStreak: user.streak, streakBonus };
}

async function validateAndFixStreakIST(user) {
    if (!user) return user;

    const latest = await ChallengeCompletion.findOne({ user: user._id })
        .sort({ dayKey: -1 })
        .lean();

    if (!latest) return user;

    const todayKey = getDayKey(new Date(), IST_OFFSET_MINUTES);
    const todayNumber = getLocalDayNumber(new Date(), IST_OFFSET_MINUTES);
    const lastNumber = dayNumberFromKey(latest.dayKey);
    const diffDays = todayNumber - lastNumber;

    if (diffDays >= 2) {
        await User.updateOne({ _id: user._id }, { $set: { streak: 0 } });
        user.streak = 0;
        return user;
    }

    if (latest.dayKey === todayKey && user.lastChallengeDate) {
        // Keep as-is
        return user;
    }

    return user;
}

module.exports = {
    validateAndFixStreakIST,
    updateStreakFromActivity,
    getDayKey
};
