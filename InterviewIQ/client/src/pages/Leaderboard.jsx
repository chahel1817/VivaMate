import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Trophy, Flame, Medal, Users, TrendingUp, Award, Crown, Star } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('xp'); // 'xp', 'streak', 'weekly', 'friends'
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
                response = await api.get('/leaderboard/friends/leaderboard', {
                    params: { type: 'xp' }
                });
                setLeaderboard(response.data.leaderboard);
            } else if (activeTab === 'weekly') {
                response = await api.get('/leaderboard/weekly/current', {
                    params: { limit }
                });
                setLeaderboard(response.data.leaderboard);
            } else {
                response = await api.get(`/leaderboard/global/${activeTab}`, {
                    params: { limit, offset }
                });
                setLeaderboard(response.data.leaderboard);
                setUserStats(response.data.userStats);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-orange-600';
        return isDarkMode ? 'text-slate-400' : 'text-slate-600';
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
        return null;
    };

    const tabs = [
        { id: 'xp', label: 'Global XP', icon: Trophy },
        { id: 'streak', label: 'Streak', icon: Flame },
        { id: 'weekly', label: 'Weekly', icon: TrendingUp },
        { id: 'friends', label: 'Friends', icon: Users }
    ];

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4`}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Trophy className={`w-12 h-12 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Leaderboard
                            </h1>
                        </div>
                        <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Compete with the best interview masters
                        </p>
                    </div>

                    {/* User Rank Card (Sticky) */}
                    {userStats && activeTab !== 'friends' && activeTab !== 'weekly' && (
                        <div className={`sticky top-4 z-10 mb-6 p-6 rounded-2xl border-2 ${isDarkMode
                            ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700/50 backdrop-blur-sm'
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-700' : 'bg-purple-500'
                                        } text-white font-black text-2xl`}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Your Rank</p>
                                        <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            #{userStats.rank || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {activeTab === 'xp' ? 'Total XP' : 'Current Streak'}
                                    </p>
                                    <p className={`text-3xl font-black ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                                        {userStats.score || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setOffset(0);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? isDarkMode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-500 text-white'
                                        : isDarkMode
                                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            : 'bg-white text-slate-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Leaderboard Table */}
                    <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                        } overflow-hidden`}>
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading leaderboard...</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="p-12 text-center">
                                <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    No data available yet
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Complete challenges to appear on the leaderboard!
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Top 3 Podium */}
                                {offset === 0 && leaderboard.length >= 3 && (
                                    <div className={`p-8 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
                                            {/* 2nd Place */}
                                            {leaderboard[1] && (
                                                <div className="flex-1 text-center">
                                                    <div className="relative inline-block mb-3">
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-black text-2xl border-4 border-gray-400">
                                                            {leaderboard[1].name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-black text-sm">
                                                            2
                                                        </div>
                                                    </div>
                                                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {leaderboard[1].name}
                                                    </p>
                                                    <p className={`text-2xl font-black text-gray-400`}>
                                                        {leaderboard[1].score || leaderboard[1].weeklyXP}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 1st Place */}
                                            {leaderboard[0] && (
                                                <div className="flex-1 text-center -mt-8">
                                                    <div className="relative inline-block mb-3">
                                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-white font-black text-3xl border-4 border-yellow-400 shadow-lg">
                                                            {leaderboard[0].name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                                            <Crown className="w-8 h-8 text-yellow-400" />
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-black">
                                                            1
                                                        </div>
                                                    </div>
                                                    <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {leaderboard[0].name}
                                                    </p>
                                                    <p className={`text-3xl font-black text-yellow-500`}>
                                                        {leaderboard[0].score || leaderboard[0].weeklyXP}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 3rd Place */}
                                            {leaderboard[2] && (
                                                <div className="flex-1 text-center">
                                                    <div className="relative inline-block mb-3">
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-black text-2xl border-4 border-orange-500">
                                                            {leaderboard[2].name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                                                            3
                                                        </div>
                                                    </div>
                                                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {leaderboard[2].name}
                                                    </p>
                                                    <p className={`text-2xl font-black text-orange-600`}>
                                                        {leaderboard[2].score || leaderboard[2].weeklyXP}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Leaderboard List */}
                                <div className="divide-y divide-slate-700">
                                    {leaderboard.map((entry, index) => (
                                        <div
                                            key={entry.userId}
                                            className={`p-4 flex items-center gap-4 transition-colors ${entry.isCurrentUser || entry.userId === user?._id
                                                ? isDarkMode
                                                    ? 'bg-purple-900/30 border-l-4 border-purple-500'
                                                    : 'bg-purple-50 border-l-4 border-purple-500'
                                                : isDarkMode
                                                    ? 'hover:bg-slate-700/50'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {/* Rank */}
                                            <div className="w-12 text-center">
                                                {getRankIcon(entry.rank) || (
                                                    <span className={`text-2xl font-black ${getRankColor(entry.rank)}`}>
                                                        {entry.rank}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${entry.rank === 1 ? 'bg-yellow-500' :
                                                entry.rank === 2 ? 'bg-gray-400' :
                                                    entry.rank === 3 ? 'bg-orange-600' :
                                                        'bg-purple-500'
                                                }`}>
                                                {entry.name?.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name & Badges */}
                                            <div className="flex-1">
                                                <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {entry.name}
                                                    {(entry.isCurrentUser || entry.userId === user?._id) && (
                                                        <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex gap-1 mt-1">
                                                    {entry.badges?.slice(0, 3).map((badge, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-slate-600'
                                                                }`}
                                                        >
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                                                    {entry.score || entry.weeklyXP || 0}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {activeTab === 'xp' ? 'XP' : activeTab === 'streak' ? 'days' : 'Weekly XP'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Load More */}
                    {!loading && leaderboard.length === limit && activeTab !== 'friends' && activeTab !== 'weekly' && (
                        <div className="text-center mt-6">
                            <button
                                onClick={() => setOffset(offset + limit)}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${isDarkMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                    }`}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Leaderboard;
