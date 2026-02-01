const User = require('../models/User');

/**
 * Achievement System
 * Defines all achievements and handles unlocking logic
 */

// Achievement definitions
const ACHIEVEMENTS = {
    // XP Milestones
    first_steps: {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Earn your first 100 XP',
        category: 'xp',
        xpRequired: 100,
        badge: 'Novice',
        icon: '🎯',
        rarity: 'common'
    },
    rising_star: {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Reach 500 XP',
        category: 'xp',
        xpRequired: 500,
        badge: 'Warrior',
        icon: '⭐',
        rarity: 'common'
    },
    interview_legend: {
        id: 'interview_legend',
        name: 'Interview Legend',
        description: 'Accumulate 1000 XP',
        category: 'xp',
        xpRequired: 1000,
        badge: 'Legend',
        icon: '👑',
        rarity: 'rare'
    },
    master_interviewer: {
        id: 'master_interviewer',
        name: 'Master Interviewer',
        description: 'Reach the elite 5000 XP milestone',
        category: 'xp',
        xpRequired: 5000,
        badge: 'Master',
        icon: '🏆',
        rarity: 'epic'
    },
    xp_titan: {
        id: 'xp_titan',
        name: 'XP Titan',
        description: 'Achieve legendary status with 10,000 XP',
        category: 'xp',
        xpRequired: 10000,
        badge: 'Titan',
        icon: '💎',
        rarity: 'legendary'
    },

    // Streak Achievements
    week_warrior: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'streak',
        streakRequired: 7,
        badge: 'Streak Master',
        icon: '🔥',
        rarity: 'common'
    },
    month_champion: {
        id: 'month_champion',
        name: 'Month Champion',
        description: 'Keep a 30-day streak alive',
        category: 'streak',
        streakRequired: 30,
        badge: 'Unstoppable',
        icon: '💪',
        rarity: 'rare'
    },
    quarter_conqueror: {
        id: 'quarter_conqueror',
        name: 'Quarter Conqueror',
        description: 'Achieve a 90-day streak',
        category: 'streak',
        streakRequired: 90,
        badge: 'Relentless',
        icon: '🚀',
        rarity: 'epic'
    },
    year_legend: {
        id: 'year_legend',
        name: 'Year Legend',
        description: 'Complete a full year streak (365 days)',
        category: 'streak',
        streakRequired: 365,
        badge: 'Eternal',
        icon: '🌟',
        rarity: 'legendary'
    },

    // Challenge Achievements
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Score 100% on a challenge',
        category: 'challenge',
        condition: 'perfect_score',
        badge: 'Perfectionist',
        icon: '💯',
        rarity: 'rare'
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a challenge in under 2 minutes',
        category: 'challenge',
        condition: 'fast_completion',
        badge: 'Lightning',
        icon: '⚡',
        rarity: 'rare'
    },
    consistent_performer: {
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: 'Complete 10 challenges in a row',
        category: 'challenge',
        condition: 'consistency',
        badge: 'Reliable',
        icon: '📊',
        rarity: 'epic'
    },
    challenge_master: {
        id: 'challenge_master',
        name: 'Challenge Master',
        description: 'Complete 100 challenges',
        category: 'challenge',
        challengesRequired: 100,
        badge: 'Challenge Master',
        icon: '🎓',
        rarity: 'epic'
    },

    // Level Achievements
    level_10: {
        id: 'level_10',
        name: 'Double Digits',
        description: 'Reach level 10',
        category: 'level',
        levelRequired: 10,
        badge: 'Level 10',
        icon: '🔟',
        rarity: 'common'
    },
    level_25: {
        id: 'level_25',
        name: 'Quarter Century',
        description: 'Reach level 25',
        category: 'level',
        levelRequired: 25,
        badge: 'Level 25',
        icon: '🎖️',
        rarity: 'rare'
    },
    level_50: {
        id: 'level_50',
        name: 'Half Century',
        description: 'Reach level 50',
        category: 'level',
        levelRequired: 50,
        badge: 'Level 50',
        icon: '🏅',
        rarity: 'epic'
    },

    // Special Achievements
    early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete 10 challenges before 8 AM',
        category: 'special',
        condition: 'morning_challenges',
        badge: 'Early Riser',
        icon: '🌅',
        rarity: 'rare'
    },
    night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 10 challenges after 10 PM',
        category: 'special',
        condition: 'night_challenges',
        badge: 'Night Owl',
        icon: '🦉',
        rarity: 'rare'
    },
    comeback_kid: {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        description: 'Rebuild a streak after breaking one',
        category: 'special',
        condition: 'streak_recovery',
        badge: 'Resilient',
        icon: '💪',
        rarity: 'rare'
    },
    weekend_warrior: {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Complete challenges on 10 consecutive weekends',
        category: 'special',
        condition: 'weekend_challenges',
        badge: 'Weekend Warrior',
        icon: '🎉',
        rarity: 'epic'
    }
};

/**
 * Check if user has earned any new achievements
 */
async function checkAchievements(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return [];
        }

        const newAchievements = [];
        const userAchievementIds = user.achievements?.map(a => a.achievementId) || [];

        // Check each achievement
        for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
            // Skip if already unlocked
            if (userAchievementIds.includes(achievementId)) {
                continue;
            }

            // Check if criteria met
            const unlocked = await checkAchievementCriteria(user, achievement);

            if (unlocked) {
                await awardAchievement(userId, achievementId);
                newAchievements.push(achievement);
            }
        }

        return newAchievements;
    } catch (err) {
        console.error('Error checking achievements:', err);
        return [];
    }
}

/**
 * Check if achievement criteria is met
 */
async function checkAchievementCriteria(user, achievement) {
    // XP-based achievements
    if (achievement.xpRequired) {
        return user.xp >= achievement.xpRequired;
    }

    // Streak-based achievements
    if (achievement.streakRequired) {
        return user.streak >= achievement.streakRequired;
    }

    // Level-based achievements
    if (achievement.levelRequired) {
        return user.level >= achievement.levelRequired;
    }

    // Challenge count achievements
    if (achievement.challengesRequired) {
        return (user.completedChallenges?.length || 0) >= achievement.challengesRequired;
    }

    // Special condition achievements
    if (achievement.condition) {
        return await checkSpecialCondition(user, achievement.condition);
    }

    return false;
}

/**
 * Check special achievement conditions
 */
async function checkSpecialCondition(user, condition) {
    switch (condition) {
        case 'perfect_score':
            // Check if user has any perfect scores
            return user.completedChallenges?.some(c => c.score === c.total) || false;

        case 'fast_completion':
            // This would need to be tracked separately with completion times
            // For now, return false
            return false;

        case 'consistency':
            // Check if user has 10 consecutive challenges
            return (user.completedChallenges?.length || 0) >= 10;

        case 'morning_challenges':
        case 'night_challenges':
        case 'streak_recovery':
        case 'weekend_challenges':
            // These would need additional tracking
            // For now, return false
            return false;

        default:
            return false;
    }
}

/**
 * Award achievement to user
 */
async function awardAchievement(userId, achievementId) {
    try {
        const achievement = ACHIEVEMENTS[achievementId];

        if (!achievement) {
            console.error(`Achievement ${achievementId} not found`);
            return false;
        }

        const user = await User.findById(userId);

        if (!user) {
            console.error(`User ${userId} not found`);
            return false;
        }

        // Check if already has achievement
        if (user.achievements?.some(a => a.achievementId === achievementId)) {
            return false;
        }

        // Add achievement
        if (!user.achievements) {
            user.achievements = [];
        }

        user.achievements.push({
            achievementId: achievementId,
            unlockedAt: new Date(),
            progress: 100
        });

        // Add badge if not already present
        if (achievement.badge && !user.badges.includes(achievement.badge)) {
            user.badges.push(achievement.badge);
        }

        await user.save();

        console.log(`✅ Awarded achievement "${achievement.name}" to user ${userId}`);
        return true;
    } catch (err) {
        console.error('Error awarding achievement:', err);
        return false;
    }
}

/**
 * Get all achievements with user's progress
 */
async function getUserAchievements(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return [];
        }

        const userAchievements = user.achievements || [];
        const achievements = [];

        for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
            const userAchievement = userAchievements.find(a => a.achievementId === achievementId);

            const progress = userAchievement
                ? 100
                : await getAchievementProgress(user, achievement);

            achievements.push({
                ...achievement,
                unlocked: !!userAchievement,
                unlockedAt: userAchievement?.unlockedAt || null,
                progress: progress
            });
        }

        // Sort by unlocked first, then by rarity
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        achievements.sort((a, b) => {
            if (a.unlocked !== b.unlocked) {
                return a.unlocked ? -1 : 1;
            }
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });

        return achievements;
    } catch (err) {
        console.error('Error getting user achievements:', err);
        return [];
    }
}

/**
 * Get progress toward specific achievement
 */
async function getAchievementProgress(user, achievement) {
    // XP-based
    if (achievement.xpRequired) {
        return Math.min(100, Math.floor((user.xp / achievement.xpRequired) * 100));
    }

    // Streak-based
    if (achievement.streakRequired) {
        return Math.min(100, Math.floor((user.streak / achievement.streakRequired) * 100));
    }

    // Level-based
    if (achievement.levelRequired) {
        return Math.min(100, Math.floor((user.level / achievement.levelRequired) * 100));
    }

    // Challenge count
    if (achievement.challengesRequired) {
        const completed = user.completedChallenges?.length || 0;
        return Math.min(100, Math.floor((completed / achievement.challengesRequired) * 100));
    }

    return 0;
}

/**
 * Get all achievement definitions
 */
function getAllAchievements() {
    return Object.values(ACHIEVEMENTS);
}

/**
 * Get achievements by category
 */
function getAchievementsByCategory(category) {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

module.exports = {
    ACHIEVEMENTS,
    checkAchievements,
    awardAchievement,
    getUserAchievements,
    getAchievementProgress,
    getAllAchievements,
    getAchievementsByCategory
};
