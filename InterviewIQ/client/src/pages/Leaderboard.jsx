import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
    Trophy, Flame, Medal, Users, TrendingUp, Crown, Star,
    ChevronDown, UserPlus, UserCheck, Trash2,
    Mail, CheckCircle, Clock, Send, X
} from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('xp');
    const [leaderboard, setLeaderboard] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [limit] = useState(100);
    const [offset, setOffset] = useState(0);

    // Friends state
    const [friendsList, setFriendsList] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // Derived
    const incomingRequests = friendsList.filter(f => f.status === 'incoming');
    const pendingRequests = friendsList.filter(f => f.status === 'pending');
    const acceptedFriends = friendsList.filter(f => f.status === 'accepted');

    // Always fetch friends list so badge shows on every tab
    useEffect(() => {
        fetchFriendsList();
    }, []);

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

    const fetchFriendsList = async () => {
        setFriendsLoading(true);
        try {
            const res = await api.get('/leaderboard/friends');
            setFriendsList(res.data.friends || []);
        } catch (err) {
            console.error('Error fetching friends:', err);
        } finally {
            setFriendsLoading(false);
        }
    };

    const sendFriendRequest = async () => {
        if (!addEmail.trim()) return;
        setAddLoading(true);
        try {
            await api.post('/leaderboard/friends/add', { email: addEmail.trim() });
            toast.success('Friend request sent!');
            setAddEmail('');
            fetchFriendsList();
        } catch (err) {
            if (!err.handled) {
                toast.error(err.response?.data?.message || 'Failed to send request');
            }
        } finally {
            setAddLoading(false);
        }
    };

    const acceptRequest = async (friendId) => {
        try {
            await api.post(`/leaderboard/friends/accept/${friendId}`);
            toast.success('Friend added! 🎉');
            fetchFriendsList();
            if (activeTab === 'friends') fetchLeaderboard();
        } catch (err) {
            if (!err.handled) {
                toast.error(err.response?.data?.message || 'Failed to accept');
            }
        }
    };

    const declineRequest = async (friendId) => {
        try {
            await api.post(`/leaderboard/friends/decline/${friendId}`);
            toast.success('Request declined');
            fetchFriendsList();
        } catch (err) {
            toast.error('Failed to decline request');
        }
    };

    const removeFriend = async (friendId) => {
        try {
            await api.delete(`/leaderboard/friends/remove/${friendId}`);
            toast.success('Friend removed');
            fetchFriendsList();
            if (activeTab === 'friends') fetchLeaderboard();
        } catch (err) {
            toast.error('Failed to remove friend');
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
        { idx: 1, place: 2, size: 'w-16 h-16', textSize: 'text-xl', pillBg: 'bg-slate-400', gradient: 'from-slate-300 to-slate-500', border: 'border-slate-400', barH: 'h-20', shadow: 'shadow-slate-400/30', scoreColor: 'text-slate-400', barBg: isDarkMode ? 'bg-slate-600' : 'bg-slate-300' },
        { idx: 0, place: 1, size: 'w-20 h-20', textSize: 'text-2xl', pillBg: 'bg-yellow-500', gradient: 'from-yellow-300 to-amber-600', border: 'border-yellow-400', barH: 'h-32', shadow: 'shadow-yellow-400/40', scoreColor: 'text-yellow-400', barBg: isDarkMode ? 'bg-yellow-700/60' : 'bg-yellow-200' },
        { idx: 2, place: 3, size: 'w-16 h-16', textSize: 'text-xl', pillBg: 'bg-orange-600', gradient: 'from-orange-400 to-orange-700', border: 'border-orange-500', barH: 'h-14', shadow: 'shadow-orange-500/30', scoreColor: 'text-orange-500', barBg: isDarkMode ? 'bg-orange-800/60' : 'bg-orange-200' },
    ];

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

                {/* Hero Header */}
                <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900' : 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800'}`}>
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-yellow-400/10 border border-yellow-500/20' : 'bg-white/10'}`}>
                                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Leaderboard</h1>
                        </div>
                        <p className={`text-sm sm:text-base mt-2 ${isDarkMode ? 'text-slate-400' : 'text-purple-200'}`}>
                            Compete with the best interview masters worldwide
                        </p>

                        {/* Tabs */}
                        <div
                            className="flex gap-2 mt-6 justify-center overflow-x-auto pb-1 -mx-4 px-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setOffset(0); }}
                                        className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${isActive
                                            ? 'bg-white text-purple-700 shadow-lg shadow-white/20'
                                            : isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                        {tab.id === 'friends' && incomingRequests.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                                                {incomingRequests.length}
                                            </span>
                                        )}
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
                            <div className="relative flex-shrink-0">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'} shadow-lg`}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                    <Star className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>Your Standing</p>
                                <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
                            </div>
                            <div className="flex gap-6 sm:gap-8">
                                <div className="text-center">
                                    <p className={`text-xs font-medium mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rank</p>
                                    <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>#{userStats.rank || '—'}</p>
                                </div>
                                <div className={`w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                <div className="text-center">
                                    <p className={`text-xs font-medium mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activeTab === 'xp' ? 'Total XP' : 'Streak'}</p>
                                    <p className="text-2xl sm:text-3xl font-black text-yellow-400">{userStats.score || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Friends Tab ── inlined to avoid re-mount on state change */}
                    {activeTab === 'friends' ? (
                        <div className="space-y-5">

                            {/* Add a Friend */}
                            <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50'}`}>
                                        <UserPlus className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Add a Friend</h3>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter their registered email address</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="friend@example.com"
                                            value={addEmail}
                                            onChange={e => setAddEmail(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendFriendRequest()}
                                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                                                }`}
                                        />
                                    </div>
                                    <button
                                        onClick={sendFriendRequest}
                                        disabled={addLoading || !addEmail.trim()}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-purple-900/30 active:scale-95"
                                    >
                                        {addLoading
                                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <Send className="w-4 h-4" />
                                        }
                                        <span className="hidden sm:inline">Send Request</span>
                                    </button>
                                </div>
                            </div>

                            {/* Incoming Requests */}
                            {incomingRequests.length > 0 && (
                                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className={`px-5 py-3.5 border-b flex items-center gap-2 ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-amber-50'}`}>
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                                            Incoming Requests ({incomingRequests.length})
                                        </h3>
                                    </div>
                                    <div className={`divide-y ${isDarkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                        {incomingRequests.map(f => (
                                            <div key={f.userId} className="flex items-center gap-3 px-5 py-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {f.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                                                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{f.email}</p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => acceptRequest(f.userId)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-all active:scale-95"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Accept</span>
                                                    </button>
                                                    <button
                                                        onClick={() => declineRequest(f.userId)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                            }`}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Decline</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sent / Pending */}
                            {pendingRequests.length > 0 && (
                                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className={`px-5 py-3.5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
                                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Sent Requests ({pendingRequests.length})
                                        </h3>
                                    </div>
                                    <div className={`divide-y ${isDarkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                        {pendingRequests.map(f => (
                                            <div key={f.userId} className="flex items-center gap-3 px-5 py-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-600' : 'bg-slate-400'}`}>
                                                    {f.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                                                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{f.email}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Pending
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Friends List */}
                            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                            Friends · {acceptedFriends.length}
                                        </h3>
                                    </div>
                                    {acceptedFriends.length > 0 && (
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ranked by XP</p>
                                    )}
                                </div>

                                {friendsLoading ? (
                                    <div className="p-12 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading friends…</p>
                                    </div>
                                ) : acceptedFriends.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                        <p className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No friends yet</p>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add a friend using their email above!</p>
                                    </div>
                                ) : (
                                    <div className={`divide-y ${isDarkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                        {leaderboard.map((entry, index) => {
                                            const isMe = entry.isCurrentUser || entry.userId === user?._id;
                                            const rank = entry.rank ?? index + 1;
                                            const avatarColors = {
                                                1: 'bg-gradient-to-br from-yellow-400 to-amber-600',
                                                2: 'bg-gradient-to-br from-slate-400 to-slate-600',
                                                3: 'bg-gradient-to-br from-orange-400 to-orange-700',
                                            };
                                            return (
                                                <div
                                                    key={entry.userId || index}
                                                    className={`flex items-center gap-3 px-5 py-4 transition-colors ${isMe
                                                        ? isDarkMode ? 'bg-purple-900/20 border-l-4 border-purple-500' : 'bg-purple-50 border-l-4 border-purple-400'
                                                        : isDarkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="w-7 text-center flex-shrink-0">
                                                        {rank === 1 ? <Crown className="w-5 h-5 text-yellow-400 mx-auto" /> :
                                                            rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> :
                                                                rank === 3 ? <Medal className="w-5 h-5 text-orange-500 mx-auto" /> :
                                                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{rank}</span>}
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColors[rank] || (isDarkMode ? 'bg-purple-600' : 'bg-purple-500')}`}>
                                                        {entry.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{entry.name}</p>
                                                            {isMe && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">You</span>}
                                                        </div>
                                                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            Lv.{entry.level ?? 1} · {entry.streak ?? 0}🔥
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={`text-lg font-black ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-orange-500' : isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                                            {(entry.score ?? 0).toLocaleString()}
                                                        </p>
                                                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>XP</p>
                                                    </div>
                                                    {!isMe && (
                                                        <button
                                                            onClick={() => removeFriend(entry.userId)}
                                                            title="Remove friend"
                                                            className={`ml-1 p-2 rounded-lg flex-shrink-0 transition-colors ${isDarkMode ? 'hover:bg-red-900/30 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    ) : (
                        /* ── Global / Weekly Leaderboard ── */
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
                                    {/* Podium */}
                                    {offset === 0 && leaderboard.length >= 3 && (
                                        <div className={`px-4 pt-8 pb-6 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
                                            <p className={`text-center text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>This Period's Leaders</p>
                                            <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-xs sm:max-w-sm mx-auto">
                                                {podiumConfigs.map(({ idx, place, size, textSize, pillBg, gradient, border, barH, shadow, scoreColor, barBg }) => {
                                                    const entry = leaderboard[idx];
                                                    if (!entry) return null;
                                                    return (
                                                        <div key={place} className="flex flex-col items-center flex-1">
                                                            {place === 1 && <Crown className="w-6 h-6 text-yellow-400 mb-1 animate-pulse" />}
                                                            <div className="relative mb-2">
                                                                <div className={`${size} rounded-full bg-gradient-to-br ${gradient} border-4 ${border} flex items-center justify-center text-white font-black ${textSize} shadow-xl ${shadow}`}>
                                                                    {entry.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className={`absolute -bottom-2 -right-1 w-6 h-6 rounded-full ${pillBg} flex items-center justify-center text-white font-black text-xs shadow`}>
                                                                    {place}
                                                                </div>
                                                            </div>
                                                            <p className={`text-xs sm:text-sm font-bold text-center truncate max-w-full px-1 mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{entry.name}</p>
                                                            <p className={`text-sm sm:text-base font-black ${scoreColor}`}>{getScore(entry).toLocaleString()}</p>
                                                            <div className={`w-full mt-3 rounded-t-lg ${barH} ${barBg}`} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* List */}
                                    <div className={`divide-y ${isDarkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                        {leaderboard.map((entry, index) => {
                                            const isMe = entry.isCurrentUser || entry.userId === user?._id;
                                            const rank = entry.rank ?? index + 1;
                                            const rankColors = { 1: 'text-yellow-400', 2: 'text-slate-400', 3: 'text-orange-500' };
                                            const avatarColors = {
                                                1: 'bg-gradient-to-br from-yellow-400 to-amber-600',
                                                2: 'bg-gradient-to-br from-slate-400 to-slate-600',
                                                3: 'bg-gradient-to-br from-orange-400 to-orange-700',
                                            };
                                            return (
                                                <div
                                                    key={entry.userId || index}
                                                    className={`flex items-center gap-3 sm:gap-4 px-4 py-3.5 transition-colors ${isMe
                                                        ? isDarkMode ? 'bg-purple-900/25 border-l-4 border-purple-500' : 'bg-purple-50 border-l-4 border-purple-400'
                                                        : isDarkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="w-8 sm:w-10 flex-shrink-0 text-center">
                                                        {rank === 1 ? <Crown className={`w-5 h-5 mx-auto ${rankColors[1]}`} /> :
                                                            rank === 2 ? <Medal className={`w-5 h-5 mx-auto ${rankColors[2]}`} /> :
                                                                rank === 3 ? <Medal className={`w-5 h-5 mx-auto ${rankColors[3]}`} /> :
                                                                    <span className={`text-base font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{rank}</span>}
                                                    </div>
                                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm ${avatarColors[rank] || (isDarkMode ? 'bg-purple-600' : 'bg-purple-500')}`}>
                                                        {entry.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <p className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{entry.name}</p>
                                                            {isMe && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">You</span>}
                                                        </div>
                                                        {entry.badges?.length > 0 && (
                                                            <div className="flex gap-1 mt-0.5 overflow-hidden">
                                                                {entry.badges.slice(0, 2).map((badge, i) => (
                                                                    <span key={i} className={`text-xs px-1.5 py-0.5 rounded-full truncate ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{badge}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <p className={`text-lg sm:text-xl font-black ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-orange-500' : isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                                            {getScore(entry).toLocaleString()}
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
                    )}

                    {/* Load More */}
                    {!loading && activeTab !== 'friends' && leaderboard.length === limit && activeTab !== 'weekly' && (
                        <div className="text-center pb-6">
                            <button
                                onClick={() => setOffset(offset + limit)}
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDarkMode
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200'
                                    }`}
                            >
                                Load More <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Leaderboard;
