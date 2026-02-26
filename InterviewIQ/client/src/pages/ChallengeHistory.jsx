import { useState, useEffect } from "react";
import api from "../services/api";
import { useTheme } from "../context/themeContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Award, Star, ArrowLeft, Flame, Trophy, Filter, TrendingUp, Clock } from "lucide-react";

const DIFF_COLORS = {
    easy: { bg: "bg-green-500/10 text-green-500 border-green-500/20" },
    medium: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    hard: { bg: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function ChallengeHistory() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, easy, medium, hard
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/history");
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "all" ? history : history.filter(h => h.difficulty?.toLowerCase() === filter);
    const paginated = filtered.slice(0, page * PER_PAGE);
    const hasMore = paginated.length < filtered.length;

    // Summary stats
    const totalXP = history.reduce((s, h) => s + (h.xpEarned || 0), 0);
    const avgScore = history.length ? (history.reduce((s, h) => s + (h.score || 0), 0) / history.length).toFixed(1) : 0;
    const perfectScores = history.filter(h => h.score === h.total && h.total > 0).length;

    // Activity heatmap — last 7 columns (weeks), up to 7 days each
    const buildHeatmap = () => {
        const today = new Date();
        const days = [];
        for (let i = 41; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toDateString();
            const count = history.filter(h => new Date(h.date).toDateString() === dateStr).length;
            days.push({ date: d, count });
        }
        return days;
    };
    const heatmap = buildHeatmap();

    const heatColor = (count) => {
        if (count === 0) return isDarkMode ? 'bg-slate-800' : 'bg-slate-100';
        if (count === 1) return 'bg-purple-400/40';
        if (count === 2) return 'bg-purple-500/60';
        return 'bg-purple-600';
    };

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>

                {/* Header */}
                <div className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Challenge History</h1>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{history.length} challenges completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* Summary Stats */}
                    {!loading && history.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total XP Earned", value: totalXP, icon: Star, color: "text-yellow-400", bg: isDarkMode ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200' },
                                { label: "Avg Score", value: `${avgScore}`, icon: TrendingUp, color: "text-purple-400", bg: isDarkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200' },
                                { label: "Perfect Rounds", value: perfectScores, icon: Trophy, color: "text-green-400", bg: isDarkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200' },
                            ].map(stat => (
                                <div key={stat.label} className={`rounded-2xl border p-4 ${stat.bg}`}>
                                    <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                    <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                                    <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Activity Heatmap */}
                    {!loading && history.length > 0 && (
                        <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Activity — Last 6 Weeks</h3>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {heatmap.map((d, i) => (
                                    <div
                                        key={i}
                                        title={`${d.date.toLocaleDateString()}: ${d.count} challenge${d.count !== 1 ? 's' : ''}`}
                                        className={`w-4 h-4 rounded-sm transition-colors ${heatColor(d.count)}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Less</span>
                                {[0, 1, 2, 3].map(v => (
                                    <div key={v} className={`w-3.5 h-3.5 rounded-sm ${heatColor(v)}`} />
                                ))}
                                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>More</span>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    {!loading && history.length > 0 && (
                        <div className="flex gap-2">
                            {["all", "easy", "medium", "hard"].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${filter === f
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* History List */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => <div key={i} className={`h-20 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={`rounded-2xl border p-16 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <Calendar className={`w-14 h-14 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No challenges found</p>
                            <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {filter !== "all" ? `No ${filter} difficulty challenges yet` : "Complete a challenge to see your history"}
                            </p>
                            <button
                                onClick={() => navigate('/daily-challenge')}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all"
                            >
                                Start a Challenge
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginated.map((item, index) => {
                                    const diffKey = item.difficulty?.toLowerCase() in DIFF_COLORS ? item.difficulty.toLowerCase() : "medium";
                                    const pct = item.total > 0 ? Math.round((item.score / item.total) * 100) : null;
                                    return (
                                        <div
                                            key={item.id || index}
                                            className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm ${pct >= 80 ? 'bg-green-900/30 text-green-400' :
                                                        pct >= 50 ? 'bg-amber-900/30 text-amber-400' :
                                                            'bg-red-900/30 text-red-400'
                                                    }`}>
                                                    {pct !== null ? `${pct}%` : '✓'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title || "Daily Challenge"}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        {item.difficulty && (
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLORS[diffKey].bg}`}>
                                                                {item.difficulty}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                {item.score !== undefined && item.total !== undefined ? (
                                                    <p className={`text-xl font-black ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {item.score}/{item.total}
                                                    </p>
                                                ) : (
                                                    <p className={`text-base font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Done</p>
                                                )}
                                                <p className={`text-xs font-bold text-yellow-500 flex items-center justify-end gap-1 mt-0.5`}>
                                                    <Star className="w-3 h-3" />+{item.xpEarned || 0} XP
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {hasMore && (
                                <div className="text-center">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all border ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        Load More ({filtered.length - paginated.length} remaining)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
