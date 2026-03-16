import { useState, useEffect } from "react";
import api from "../services/api";
import { useTheme } from "../context/themeContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    Calendar, Award, Star, ArrowLeft, Sparkles, Medal,
    Filter, TrendingUp, Clock, Cpu, User, History as HistoryIcon,
    ChevronRight, ExternalLink, Atom, Target
} from "lucide-react";

const TYPE_CONFIG = {
    all: { label: "All Activity", icon: HistoryIcon, color: "text-blue-400" },
    challenge: { label: "Challenges", icon: Atom, color: "text-orange-400" },
    interview: { label: "Interviews", icon: Cpu, color: "text-purple-400" },
};

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
    const [activeTab, setActiveTab] = useState("all");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/history/unified");
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = history.filter(item => {
        const typeMatch = activeTab === "all" || item.type === activeTab;
        const diffMatch = filter === "all" || item.difficulty?.toLowerCase() === filter;
        return typeMatch && diffMatch;
    });

    const paginated = filtered.slice(0, page * PER_PAGE);
    const hasMore = paginated.length < filtered.length;

    // Summary stats based on ALL history
    const totalXP = history.reduce((s, h) => s + (h.xpEarned || 0), 0);
    const avgScore = history.length ? (history.reduce((s, h) => {
        // Normalize challenge scores to percentages for average
        const pct = h.total > 0 ? (h.score / h.total) * 100 : h.score;
        return s + pct;
    }, 0) / history.length).toFixed(0) : 0;

    const countByType = (type) => history.filter(h => h.type === type).length;

    // Activity heatmap
    const buildHeatmap = () => {
        const today = new Date();
        const days = [];
        for (let i = 55; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const count = history.filter(h => {
                const hDate = new Date(h.date).toISOString().split('T')[0];
                return hDate === dateStr;
            }).length;
            days.push({ date: d, count });
        }
        return days;
    };
    const heatmap = buildHeatmap();

    const heatColor = (count) => {
        if (count === 0) return isDarkMode ? 'bg-slate-800' : 'bg-slate-200';
        if (count === 1) return 'bg-purple-500/40';
        if (count === 2) return 'bg-purple-500/70';
        return 'bg-purple-500';
    };

    return (
        <div className={`min-h-screen font-outfit ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
            <Navbar />

            {/* Hero Header */}
            <div className={`relative overflow-hidden border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`group p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                            >
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Medal className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Practice Hub</span>
                                </div>
                                <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Activity History</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                            {[
                                { label: "Lifetime XP", value: totalXP.toLocaleString(), icon: Star, color: "text-yellow-400" },
                                { label: "Avg performance", value: `${avgScore}%`, icon: Target, color: "text-blue-400" },
                            ].map(item => (
                                <div key={item.label} className={`px-4 py-3 sm:px-6 sm:py-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                        <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color}`} />
                                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-black">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Sidebar: Filters & Heatmap */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Stats mini-grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <Atom className="w-5 h-5 text-orange-500 mb-2" />
                                <p className="text-2xl font-black">{countByType('challenge')}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Challenges</p>
                            </div>
                            <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <Cpu className="w-5 h-5 text-purple-500 mb-2" />
                                <p className="text-2xl font-black">{countByType('interview')}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Interviews</p>
                            </div>
                        </div>

                        {/* Activity Heatmap */}
                        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-purple-500/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-500" /> Consistency
                                </h3>
                                <span className="text-[10px] font-bold text-slate-500">LAST 8 WEEKS</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap justify-center">
                                {heatmap.map((d, i) => (
                                    <div
                                        key={i}
                                        title={`${d.date.toLocaleDateString()}: ${d.count} activity`}
                                        className={`w-[14px] h-[14px] rounded-[3px] transition-all hover:scale-125 ${heatColor(d.count)} cursor-default`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <span className="text-[10px] text-slate-500">Less</span>
                                {[0, 1, 2, 3].map(v => <div key={v} className={`w-2 h-2 rounded-full ${heatColor(v)}`} />)}
                                <span className="text-[10px] text-slate-500">More</span>
                            </div>
                        </div>

                        {/* Tabs / Sidebar Filter UI */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Filter by type</p>
                            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => { setActiveTab(key); setPage(1); }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${activeTab === key
                                        ? `border-purple-500/50 ${isDarkMode ? 'bg-purple-900/20 text-white' : 'bg-purple-50 text-purple-900'}`
                                        : `${isDarkMode ? 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl scale-95 ${activeTab === key ? 'bg-purple-500/20' : isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            <cfg.icon className={`w-4 h-4 ${activeTab === key ? 'text-purple-400' : 'text-slate-500'}`} />
                                        </div>
                                        <span className="text-sm font-bold">{cfg.label}</span>
                                    </div>
                                    {activeTab === key && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content: History List */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Difficulty Selector (Horizontal Pills) */}
                        <div className="flex items-center justify-between bg-slate-100/10 p-1 rounded-2xl backdrop-blur-sm">
                            <div className="flex gap-1">
                                {["all", "easy", "medium", "hard"].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { setFilter(f); setPage(1); }}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-24 rounded-[32px] animate-pulse ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`} />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className={`p-20 text-center rounded-[40px] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-white'}`}>
                                <HistoryIcon className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">No activities found</h3>
                                <p className="text-slate-500 text-sm mb-8">Ready to grow? Start your practice today!</p>
                                <button onClick={() => navigate('/practice')} className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">
                                    Start Practice
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paginated.map((item, index) => {
                                    const diffKey = item.difficulty?.toLowerCase() in DIFF_COLORS ? item.difficulty.toLowerCase() : "medium";
                                    const isInterview = item.type === "interview";

                                    // Calculate percentage for styling/shields
                                    const scoreValue = parseFloat(item.score);
                                    const totalValue = parseFloat(item.total);
                                    const pct = totalValue > 0 ? (scoreValue / totalValue) * 100 : 0;

                                    if (isNaN(scoreValue)) return null;

                                    return (
                                        <div
                                            key={item.id || index}
                                            className={`group relative p-4 sm:p-6 rounded-[32px] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isDarkMode
                                                ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/30'
                                                : 'bg-white border-slate-100 shadow-sm hover:shadow-purple-500/10'
                                                }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                                    {/* Score Circle/Shield */}
                                                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex-shrink-0 flex items-center justify-center font-black text-sm sm:text-lg shadow-inner ${pct >= 80 ? 'bg-green-500/10 text-green-500' :
                                                        pct >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {isInterview ? item.score : (item.total > 0 ? `${Math.round(pct)}%` : '✓')}
                                                        <div className={`absolute -bottom-1 -right-1 p-1 sm:p-1.5 rounded-lg border-2 ${isDarkMode ? 'bg-slate-900 border-slate-950' : 'bg-white border-slate-50'}`}>
                                                            {isInterview ? <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" /> : <Atom className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />}
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className={`font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'} text-base sm:text-lg`}>
                                                                {item.title}
                                                            </h3>
                                                            {isInterview && (
                                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase">Mock Session</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                <span className="text-[10px] sm:text-xs font-medium">
                                                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            {item.difficulty && (
                                                                <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-current uppercase tracking-wider ${DIFF_COLORS[diffKey].bg}`}>
                                                                    {item.difficulty}
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-1.5 text-yellow-500">
                                                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                                                                <span className="text-[10px] sm:text-xs font-black">+{item.xpEarned || 0} XP</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-4 sm:pt-0 border-slate-800/20">
                                                    <div className="text-left sm:text-right mr-0 sm:mr-4">
                                                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5 sm:mb-1`}>Performance</p>
                                                        <p className="font-black text-lg sm:text-xl leading-none">
                                                            {isInterview ? `${item.score}/10` : `${item.score}/${item.total}`}
                                                        </p>
                                                    </div>

                                                    {isInterview ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/interview/summary/${item.sessionId}`);
                                                            }}
                                                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-purple-600 hover:text-white hover:border-purple-600'}`}
                                                            title="View Analysis"
                                                        >
                                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                    ) : (
                                                        <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-slate-800 opacity-20' : 'bg-slate-50 opacity-20'}`}>
                                                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {hasMore && (
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        className={`w-full py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] transition-all border-2 border-dashed ${isDarkMode
                                            ? 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                                            }`}
                                    >
                                        Load More Activity
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
