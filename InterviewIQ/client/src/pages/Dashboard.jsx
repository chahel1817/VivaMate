import {
  PlayCircle,
  BarChart3,
  MessageSquare,
  Trophy,
  Flame,
  Info,
  Award,
  BookOpen,
  Sparkles,
  Zap,
  ArrowRight,
  Target,
  Activity,
  CheckCircle2,
  Terminal,
  MoveRight,
  ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import SearchAndFilter from "../components/SearchAndFilter";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { NoActivityEmpty } from "../components/EmptyState";
import DailyInsights from "../components/DailyInsights";


export default function Dashboard() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  // Remove dashboardData, use only stats for all dashboard info
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    interviewsTaken: 0,
    averageScore: null,
    lastInterview: null,
    recentActivity: []
  });
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [activeActionTab, setActiveActionTab] = useState("practice");

  const actionTabs = [
    { id: "practice", label: "Practice", icon: PlayCircle },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "community", label: "Community", icon: Trophy },
  ];

  const actionCards = {
    practice: [
      {
        icon: PlayCircle,
        title: "Start a Mock Interview",
        desc: "Answer real interview-style questions and get structured AI feedback.",
        action: "Start interview →",
        path: "/interview/type",
        tourId: "start-interview",
        featured: true,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500"
      },
      {
        icon: Trophy,
        title: "Daily Challenge",
        desc: "Keep your streak alive! Solve today's technical puzzle.",
        action: "Play now →",
        path: "/daily-challenge",
        tourId: "daily-challenge",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500"
      },
      {
        icon: BookOpen,
        title: "Question Bank",
        desc: "Browse and practice interview questions for specific subjects.",
        action: "Select subjects →",
        path: "/questions-subject",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500"
      },
    ],
    insights: [
      {
        icon: BarChart3,
        title: "View Analytics",
        desc: "Track your scores over time and measure your improvement.",
        action: "View analytics →",
        path: "/analytics",
        tourId: "analytics",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500"
      },
      {
        icon: MessageSquare,
        title: "Review Feedback",
        desc: "Go through detailed feedback from your past interviews.",
        action: "View feedback →",
        path: "/feedback",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500"
      },
    ],
    community: [
      {
        icon: Trophy,
        title: "Leaderboard",
        desc: "Compete with others and see where you rank globally!",
        action: "View leaderboard →",
        path: "/leaderboard",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500"
      },
      {
        icon: Award,
        title: "Achievements",
        desc: "Unlock achievements and earn exclusive badges.",
        action: "View achievements →",
        path: "/achievements",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        borderColor: "border-pink-500"
      },
    ]
  };

  console.log("Dashboard component rendering", { user, loading, authLoading });

  // Remove fetchDashboardData, setLoading is handled in refreshStats

  async function refreshStats() {
    try {
      setLoading(true);
      console.log("Fetching dashboard stats");
      // Use axios instance so auth token & baseURL are consistent
      const res = await api.get("/dashboard/stats");
      console.log("Dashboard stats response", res.data);
      const data = res.data;
      setStats(data);
      setFilteredActivity(data.recentActivity || []);
    } catch (e) {
      console.error('refreshStats error', e);
    } finally {
      setLoading(false);
    }
  }

  // Handle search and filtering
  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, filters);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  const applyFilters = (term, filterObj) => {
    let filtered = [...(stats.recentActivity || [])];

    // Apply search
    if (term) {
      filtered = filtered.filter(item =>
        item.role?.toLowerCase().includes(term.toLowerCase()) ||
        item.type?.toLowerCase().includes(term.toLowerCase()) ||
        item.feedback?.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Apply filters
    if (filterObj.dateRange) {
      const now = new Date();
      const filterDate = new Date();

      switch (filterObj.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(item => new Date(item.date) >= filterDate);
    }

    if (filterObj.type) {
      filtered = filtered.filter(item => item.type === filterObj.type);
    }

    if (filterObj.scoreRange) {
      filtered = filtered.filter(item => {
        const score = parseFloat(item.score);
        switch (filterObj.scoreRange) {
          case 'excellent': return score >= 8;
          case 'good': return score >= 6 && score < 8;
          case 'average': return score >= 4 && score < 6;
          case 'needs-improvement': return score < 4;
          default: return true;
        }
      });
    }

    if (filterObj.difficulty) {
      filtered = filtered.filter(item => item.difficulty === filterObj.difficulty);
    }

    setFilteredActivity(filtered);
  };

  // Skeleton Component
  const DashboardSkeleton = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} px-6 py-10 animate-pulse`}>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="h-8 bg-slate-300 dark:bg-slate-700 w-1/3 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    refreshStats();
    // Refresh user data immediately to ensure streak is up to date
    refreshUser().catch(err => console.debug("Silent refresh failed on mount"));

    let socket;
    let pollInterval;

    (async () => {
      try {
        const mod = await import("socket.io-client");
        const io = mod?.default ?? mod;
        const socketUrl =
          import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";
        socket = io(socketUrl, { transports: ["websocket"] });
        socket.on("connect", () => console.debug("socket connected"));
        socket.on("session:updated", () => refreshStats());
        socket.on("disconnect", () => console.debug("socket disconnected"));
      } catch (err) {
        console.warn(
          "socket.io-client not available, falling back to polling:",
          err
        );
      }
    })();

    // Always enable polling for real-time updates (stats + user streak)
    pollInterval = setInterval(() => {
      refreshStats();
      refreshUser().catch(() => { }); // Silent fail
    }, 10000);

    return () => {
      if (socket) {
        socket.off();
        socket.disconnect();
      }
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Show loading skeleton while auth is loading OR stats are loading
  if (authLoading || (loading && !stats.interviewsTaken)) {
    return (
      <>
        <Navbar />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100'} px-6 py-10`}>
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Auto-refresh Info Banner */}
          <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700/50 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'} border rounded-lg p-4 flex items-start gap-3`}>
            <Info size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                📊 Live Dashboard Updates
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                This page automatically refreshes every 10 seconds to show your latest progress and activities. No need to worry if you see updates—it's working perfectly!
              </p>
            </div>
          </div>

          {/* Intro */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className={`text-slate-500 mt-2 max-w-2xl ${isDarkMode ? 'text-slate-400' : ''} text-lg font-medium`}>
                Ready to ace your next interview? Here's your progress so far.
              </p>
            </div>
            <div className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-200 shadow-sm'}`}>
              Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Interviews Taken", value: stats.interviewsTaken, icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-500/10" },
              { label: "Average Score", value: stats.averageScore !== null ? `${stats.averageScore}%` : "0%", icon: Award, color: "text-purple-500", bgColor: "bg-purple-500/10" },
              { label: "Current Streak", value: user?.streak || 0, icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10" },
              { label: "Last Interview", value: stats.lastInterview ? new Date(stats.lastInterview).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "None", icon: PlayCircle, color: "text-green-500", bgColor: "bg-green-500/10" },
            ].map((item, i) => (
              <div
                key={i}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-slate-200/50'} border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-lg group`}
              >
                {/* Decorative background icon */}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <item.icon size={100} className={item.color} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.bgColor} ${item.color}`}>
                    <item.icon size={20} className={item.label === "Current Streak" ? "animate-pulse" : ""} />
                  </div>

                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {loading && !stats.interviewsTaken ? "..." : item.value}
                    </p>
                    {item.label === "Current Streak" && <span className="text-xs font-bold text-slate-400">DAYS</span>}
                  </div>

                  {item.label === "Current Streak" && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-green-400/80' : 'text-green-600'}`}>
                        <span className="inline-block w-1 h-1 rounded-full bg-green-500 animate-ping mr-1"></span>
                        Includes 48h timezone grace.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Featured Resume Clinic Widget */}
          <section className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none rounded-[32px]`} />
            <div className={`${isDarkMode ? 'bg-slate-800/10 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border rounded-[32px] p-8 relative flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-emerald-500/30 transition-all duration-500`}>
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className={`w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6`}>
                  <Sparkles size={40} className="fill-current" />
                </div>
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-3">
                    <Zap size={12} className="fill-current" /> High Impact
                  </div>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Deep Resume Diagnosis
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed font-medium`}>
                    Is your resume blocking your shortlist? Run our machine-learning simulation to see exactly what recruiters see.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/resume-clinic')}
                className="w-full lg:w-auto px-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/40 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Launch Clinic <MoveRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                What would you like to do?
              </h3>

              {/* Tab Navigation */}
              <div className={`inline-flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                {actionTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveActionTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeActionTab === tab.id
                        ? (isDarkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-slate-800 shadow-md')
                        : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                        }`}
                    >
                      <TabIcon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actionCards[activeActionTab].map((card, i) => {
                const Icon = card.icon;
                const isFeatured = card.featured;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(card.path)}
                    data-tour={card.tourId}
                    className={`
                      group cursor-pointer relative overflow-hidden
                      ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50' : 'bg-white border-slate-200 hover:bg-slate-50'} 
                      rounded-2xl border p-6
                      transition-all duration-300
                      ${isDarkMode ? `hover:${card.borderColor}/30` : `hover:${card.borderColor}/50`}
                      hover:shadow-xl hover:-translate-y-1
                      ${isFeatured ? 'md:col-span-2 lg:col-span-1 border-2 ' + card.borderColor : ''}
                    `}
                  >
                    {/* Background Decorative Element */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${card.bgColor} blur-3xl group-hover:blur-2xl transition-all duration-500 opacity-20`}></div>

                    <div className="relative z-10">
                      <div className={`p-3 rounded-xl inline-block mb-4 ${card.bgColor} ${card.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                        <Icon size={24} />
                      </div>

                      <div className="flex items-center gap-2">
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} transition`}>
                          {card.title}
                        </h4>
                        {isFeatured && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                            Popular
                          </span>
                        )}
                      </div>

                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mt-2 leading-relaxed`}>
                        {card.desc}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <span className={`
                          text-sm font-semibold ${card.color}
                          group-hover:translate-x-1 transition-transform
                        `}>
                          {card.action}
                        </span>

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'} group-hover:bg-slate-800 group-hover:text-white transition-colors`}>
                          <Icon size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Insights */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Growth & Learning
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Bite-sized knowledge to keep you sharp every day.
                </p>
              </div>
            </div>
            <DailyInsights />
          </section>

          {/* Preparation Checklist */}
          <section className={`${isDarkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-8`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="max-w-xl">
                <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                  Your Prep Checklist ✅
                </h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium`}>
                  Stay on track with these essential steps to ensure you're fully prepared.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Upload Resume", done: user?.hasResume || false, id: 1, path: '/resume-clinic' },
                { label: "First Mock Interview", done: stats.interviewsTaken > 0, id: 2, path: '/interview/type' },
                { label: "Set Career Goals", done: true, id: 3, path: '/profile' },
                { label: "Complete Daily Challenge", done: user?.lastChallengeDate && new Date(user.lastChallengeDate).toDateString() === new Date().toDateString(), id: 4, path: '/daily-challenge' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${item.done
                      ? (isDarkMode ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700')
                      : (isDarkMode ? 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300')
                    }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' : 'border-current opacity-30 shadow-inner'
                    }`}>
                    {item.done ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Activity size={20} />
                </div>
                <h3 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Recent Activity
                </h3>
              </div>
            </div>

            {/* Search and Filter Component */}
            <SearchAndFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              interviews={stats.recentActivity || []}
            />

            <div className={`space-y-3`}>
              {filteredActivity.length === 0 && (
                stats.recentActivity?.length === 0 ? (
                  <NoActivityEmpty />
                ) : (
                  <p className={`p-4 text-center text-sm font-bold opacity-40`}>
                    No results match your filters
                  </p>
                )
              )}

              {filteredActivity.map((item, index) => (
                <div
                  key={index}
                  className={`group p-5 flex justify-between items-center rounded-2xl border transition-all duration-300 ${isDarkMode
                    ? 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/60 hover:border-slate-600 shadow-none'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50'
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {item.type === 'behavioral' ? <MessageSquare size={20} /> : <Terminal size={20} />}
                    </div>
                    <div>
                      <p className={`font-black text-sm uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {item.role || item.type || 'Interview'}
                      </p>
                      <p className={`text-[10px] font-black uppercase opacity-40 mt-0.5`}>
                        Attempted on {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-0.5">Rating</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Math.round(parseFloat(item.score) / 2) ? 'bg-blue-500' : 'bg-slate-500/20'}`} />
                        ))}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase shadow-sm ${parseFloat(item.score) >= 8 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      parseFloat(item.score) >= 6 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        parseFloat(item.score) >= 4 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                      {typeof item.score === 'string' && item.score.includes('/10') ? item.score : item.score ? `${item.score}/10` : "In Progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
