import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Award, Lock, Star, TrendingUp, Zap, Target, Crown } from 'lucide-react';

const Achievements = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [achievements, setAchievements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked', or category
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        fetchAchievements();
    }, [user]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/leaderboard/achievements/user/${user._id}`);
            setAchievements(response.data.achievements);
            setStats(response.data.stats);
        } catch (err) {
            console.error('Error fetching achievements:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return isDarkMode ? 'from-purple-600 to-pink-600' : 'from-purple-500 to-pink-500';
            case 'epic':
                return isDarkMode ? 'from-purple-600 to-blue-600' : 'from-purple-500 to-blue-500';
            case 'rare':
                return isDarkMode ? 'from-blue-600 to-cyan-600' : 'from-blue-500 to-cyan-500';
            case 'common':
                return isDarkMode ? 'from-slate-600 to-slate-700' : 'from-slate-400 to-slate-500';
            default:
                return isDarkMode ? 'from-slate-600 to-slate-700' : 'from-slate-400 to-slate-500';
        }
    };

    const getRarityBadge = (rarity) => {
        const colors = {
            legendary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            epic: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
            rare: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
            common: isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-300 text-slate-700'
        };
        return colors[rarity] || colors.common;
    };

    const filteredAchievements = achievements.filter(achievement => {
        if (filter === 'all') return true;
        if (filter === 'unlocked') return achievement.unlocked;
        if (filter === 'locked') return !achievement.unlocked;
        return achievement.category === filter;
    });

    const categories = [
        { id: 'all', label: 'All', icon: Star },
        { id: 'unlocked', label: 'Unlocked', icon: Award },
        { id: 'locked', label: 'Locked', icon: Lock },
        { id: 'xp', label: 'XP', icon: TrendingUp },
        { id: 'streak', label: 'Streak', icon: Zap },
        { id: 'challenge', label: 'Challenge', icon: Target },
        { id: 'level', label: 'Level', icon: Crown }
    ];

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4`}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Award className={`w-12 h-12 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Achievements
                            </h1>
                        </div>
                        <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Unlock achievements and earn exclusive badges
                        </p>
                    </div>

                    {/* Stats Overview */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-6 h-6 text-green-500" />
                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Unlocked
                                    </p>
                                </div>
                                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {stats.unlocked}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    of {stats.total} achievements
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Lock className="w-6 h-6 text-orange-500" />
                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Locked
                                    </p>
                                </div>
                                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {stats.locked}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Keep grinding!
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Progress
                                    </p>
                                </div>
                                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {Math.round((stats.unlocked / stats.total) * 100)}%
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Completion rate
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Category Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const count = category.id === 'all'
                                ? achievements.length
                                : category.id === 'unlocked'
                                    ? stats?.unlocked
                                    : category.id === 'locked'
                                        ? stats?.locked
                                        : stats?.byCategory?.[category.id]?.total || 0;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setFilter(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${filter === category.id
                                        ? isDarkMode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-500 text-white'
                                        : isDarkMode
                                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            : 'bg-white text-slate-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {category.label}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${filter === category.id
                                        ? 'bg-white/20'
                                        : isDarkMode
                                            ? 'bg-slate-700'
                                            : 'bg-gray-200'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Achievements Grid */}
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading achievements...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAchievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    className={`p-6 rounded-2xl border cursor-pointer transition-all transform hover:scale-105 ${achievement.unlocked
                                        ? isDarkMode
                                            ? 'bg-slate-800 border-slate-700 hover:border-purple-600'
                                            : 'bg-white border-gray-200 hover:border-purple-400'
                                        : isDarkMode
                                            ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                                            : 'bg-gray-100 border-gray-300 opacity-60'
                                        }`}
                                >
                                    {/* Icon & Rarity */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center text-4xl ${!achievement.unlocked && 'grayscale'
                                            }`}>
                                            {achievement.unlocked ? achievement.icon : '🔒'}
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${getRarityBadge(achievement.rarity)}`}>
                                            {achievement.rarity.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Name & Description */}
                                    <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {achievement.name}
                                    </h3>
                                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {achievement.description}
                                    </p>

                                    {/* Progress Bar */}
                                    {!achievement.unlocked && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>Progress</span>
                                                <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {achievement.progress}%
                                                </span>
                                            </div>
                                            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                                    style={{ width: `${achievement.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Badge */}
                                    <div className="flex items-center gap-2">
                                        {achievement.unlocked ? (
                                            <>
                                                <Award className="w-4 h-4 text-green-500" />
                                                <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                    Unlocked
                                                </span>
                                                {achievement.unlockedAt && (
                                                    <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 text-orange-500" />
                                                <span className={`text-sm font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                                    Locked
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Badge Name */}
                                    {achievement.badge && (
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Rewards</p>
                                            <p className={`text-sm font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                                🏅 {achievement.badge} Badge
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredAchievements.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Lock className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                No achievements in this category
                            </p>
                        </div>
                    )}
                </div>

                {/* Achievement Detail Modal */}
                {selectedAchievement && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <div
                            className={`max-w-md w-full p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className={`w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${getRarityColor(selectedAchievement.rarity)} flex items-center justify-center text-6xl ${!selectedAchievement.unlocked && 'grayscale'
                                    }`}>
                                    {selectedAchievement.unlocked ? selectedAchievement.icon : '🔒'}
                                </div>
                                <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold mb-4 ${getRarityBadge(selectedAchievement.rarity)}`}>
                                    {selectedAchievement.rarity.toUpperCase()}
                                </span>
                                <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {selectedAchievement.name}
                                </h2>
                                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {selectedAchievement.description}
                                </p>

                                {!selectedAchievement.unlocked && (
                                    <div className="mb-6">
                                        <p className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Progress: {selectedAchievement.progress}%
                                        </p>
                                        <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                style={{ width: `${selectedAchievement.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedAchievement(null)}
                                    className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${isDarkMode
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                                        }`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Achievements;
