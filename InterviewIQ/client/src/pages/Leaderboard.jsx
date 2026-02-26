import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Trophy, Flame, Medal, Users, TrendingUp, Crown, Star, ChevronDown, Zap } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('xp');
    const [leaderboard, setLeaderboard] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [limit] = useState(100);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        fetchLeaderboard();
    }, [activeTab, offset]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            let response;
            if (activeTab === 'friends') {
                response = await api.get('/leaderboard/friends/leaderboard', { params: { type: 'xp' } });
                setLeaderboard(response.data.leaderboard);
            } else if (activeTab === 'weekly') {
                response = await api.get('/leaderboard/weekly/current', { params: { limit } });
                setLeaderboard(response.data.leaderboard);
            } else {
                response = await api.get(`/leaderboard/global/${activeTab}`, { params: { limit, offset } });
                setLeaderboard(response.data.leaderboard);
                setUserStats(response.data.userStats);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'xp', label: 'Global XP', icon: Trophy },
        { id: 'streak', label: 'Streak', icon: Flame },
        { id: 'weekly', label: 'Weekly', icon: TrendingUp },
        { id: 'friends', label: 'Friends', icon: Users },
    ];

    const getScoreLabel = () => {
        if (activeTab === 'xp') return 'XP';
        if (activeTab === 'streak') return 'days';
        return 'Weekly XP';
    };

    const getScore = (entry) => entry.score ?? entry.weeklyXP ?? 0;

    const podiumConfigs = [
        { idx: 1, place: 2, size: 'w-16 h-16', textSize: 'text-xl', pillBg: 'bg-slate-400', gradient: 'from-slate-300 to-slate-500', border: 'border-slate-400', barH: 'h-20', shadow: 'shadow-slate-400/30', scoreColor: 'text-slate-400', label: 'Silver', barBg: isDarkMode ? 'bg-slate-600' : 'bg-slate-300' },
        { idx: 0, place: 1, size: 'w-20 h-20', textSize: 'text-2xl', pillBg: 'bg-yellow-500', gradient: 'from-yellow-300 to-amber-600', border: 'border-yellow-400', barH: 'h-32', shadow: 'shadow-yellow-400/40', scoreColor: 'text-yellow-400', label: 'Gold', barBg: isDarkMode ? 'bg-yellow-700/60' : 'bg-yellow-200' },
        { idx: 2, place: 3, size: 'w-16 h-16', textSize: 'text-xl', pillBg: 'bg-orange-600', gradient: 'from-orange-400 to-orange-700', border: 'border-orange-500', barH: 'h-14', shadow: 'shadow-orange-500/30', scoreColor: 'text-orange-500', label: 'Bronze', barBg: isDarkMode ? 'bg-orange-800/60' : 'bg-orange-200' },
    ];

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

                {/* Hero Header */}
                <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900' : 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800'}`}>
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-yellow-400/10 border border-yellow-500/20' : 'bg-white/10'}`}>
                                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                                Leaderboard
                            </h1>
                        </div>
                        <p className={`text-sm sm:text-base mt-2 ${isDarkMode ? 'text-slate-400' : 'text-purple-200'}`}>
                            Compete with the best interview masters worldwide
                        </p>

                        {/* Tabs inside hero */}
                        <div className="flex gap-2 mt-6 justify-center overflow-x-auto pb-1 scrollbar-hide">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setOffset(0); }}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${isActive
                                                ? 'bg-white text-purple-700 shadow-lg shadow-white/20'
                                                : isDarkMode
                                                    ? 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                    {/* Your Rank Card */}
                    {userStats && activeTab !== 'friends' && activeTab !== 'weekly' && (
                        <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-center gap-4 ${isDarkMode
                                ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-800/50'
                                : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                            }`}>
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'} shadow-lg`}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                    <Star className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>Your Standing</p>
                                <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 sm:gap-8">
                                <div className="text-center">
                                    <p className={`text-xs font-medium mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rank</p>
                                    <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        #{userStats.rank || '—'}
                                    </p>
                                </div>
                                <div className={`w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                <div className="text-center">
                                    <p className={`text-xs font-medium mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {activeTab === 'xp' ? 'Total XP' : 'Streak'}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-black text-yellow-400">
                                        {userStats.score || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Leaderboard Panel */}
                    <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                        {loading ? (
                            <div className="p-16 text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                                <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading leaderboard…</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="p-16 text-center">
                                <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                <p className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No data yet</p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Complete challenges to appear on the leaderboard!</p>
                            </div>
                        ) : (
                            <>
                                {/* Podium — Top 3 */}
                                {offset === 0 && leaderboard.length >= 3 && (
                                    <div className={`px-4 pt-8 pb-6 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
                                        <p className={`text-center text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>This Period's Leaders</p>

                                        {/* Podium stage */}
                                        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-xs sm:max-w-sm mx-auto">
                                            {podiumConfigs.map(({ idx, place, size, textSize, pillBg, gradient, border, barH, shadow, scoreColor, barBg }) => {
                                                const entry = leaderboard[idx];
                                                if (!entry) return null;
                                                return (
                                                    <div key={place} className="flex flex-col items-center flex-1">
                                                        {/* Crown for 1st */}
                                                        {place === 1 && (
                                                            <Crown className="w-6 h-6 text-yellow-400 mb-1 animate-pulse" />
                                                        )}

                                                        {/* Avatar */}
                                                        <div className="relative mb-2">
                                                            <div className={`${size} rounded-full bg-gradient-to-br ${gradient} border-4 ${border} flex items-center justify-center text-white font-black ${textSize} shadow-xl ${shadow}`}>
                                                                {entry.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className={`absolute -bottom-2 -right-1 w-6 h-6 rounded-full ${pillBg} flex items-center justify-center text-white font-black text-xs shadow`}>
                                                                {place}
                                                            </div>
                                                        </div>

                                                        {/* Name */}
                                                        <p className={`text-xs sm:text-sm font-bold text-center truncate max-w-full px-1 mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                            {entry.name}
                                                        </p>
                                                        {/* Score */}
                                                        <p className={`text-sm sm:text-base font-black ${scoreColor}`}>
                                                            {getScore(entry).toLocaleString()}
                                                        </p>

                                                        {/* Podium bar */}
                                                        <div className={`w-full mt-3 rounded-t-lg ${barH} ${barBg}`} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Rest of the list */}
                                <div className={`divide-y ${isDarkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                    {leaderboard.map((entry, index) => {
                                        const isMe = entry.isCurrentUser || entry.userId === user?._id;
                                        const rank = entry.rank ?? index + 1;
                                        const score = getScore(entry);

                                        const rankColors = {
                                            1: 'text-yellow-400',
                                            2: 'text-slate-400',
                                            3: 'text-orange-500',
                                        };
                                        const avatarColors = {
                                            1: 'bg-gradient-to-br from-yellow-400 to-amber-600',
                                            2: 'bg-gradient-to-br from-slate-400 to-slate-600',
                                            3: 'bg-gradient-to-br from-orange-400 to-orange-700',
                                        };

                                        return (
                                            <div
                                                key={entry.userId || index}
                                                className={`flex items-center gap-3 sm:gap-4 px-4 py-3.5 transition-colors ${isMe
                                                        ? isDarkMode
                                                            ? 'bg-purple-900/25 border-l-4 border-purple-500'
                                                            : 'bg-purple-50 border-l-4 border-purple-400'
                                                        : isDarkMode
                                                            ? 'hover:bg-slate-700/40'
                                                            : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                {/* Rank */}
                                                <div className="w-8 sm:w-10 flex-shrink-0 text-center">
                                                    {rank <= 3 ? (
                                                        rank === 1
                                                            ? <Crown className={`w-5 h-5 mx-auto ${rankColors[1]}`} />
                                                            : <Medal className={`w-5 h-5 mx-auto ${rankColors[rank]}`} />
                                                    ) : (
                                                        <span className={`text-base font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {rank}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Avatar */}
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm ${avatarColors[rank] || (isDarkMode ? 'bg-purple-600' : 'bg-purple-500')
                                                    }`}>
                                                    {entry.name?.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Name / Badges */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <p className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                            {entry.name}
                                                        </p>
                                                        {isMe && (
                                                            <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entry.badges?.length > 0 && (
                                                        <div className="flex gap-1 mt-0.5 overflow-hidden">
                                                            {entry.badges.slice(0, 2).map((badge, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-xs px-1.5 py-0.5 rounded-full truncate ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                                        }`}
                                                                >
                                                                    {badge}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Score */}
                                                <div className="flex-shrink-0 text-right">
                                                    <p className={`text-lg sm:text-xl font-black ${rank === 1 ? 'text-yellow-400' :
                                                            rank === 2 ? 'text-slate-400' :
                                                                rank === 3 ? 'text-orange-500' :
                                                                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                                                        }`}>
                                                        {score.toLocaleString()}
                                                    </p>
                                                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{getScoreLabel()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Load More */}
                    {!loading && leaderboard.length === limit && activeTab !== 'friends' && activeTab !== 'weekly' && (
                        <div className="text-center pb-6">
                            <button
                                onClick={() => setOffset(offset + limit)}
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDarkMode
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200'
                                    }`}
                            >
                                Load More
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Leaderboard;
