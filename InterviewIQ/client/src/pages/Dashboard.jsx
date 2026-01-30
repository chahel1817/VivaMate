import {
  PlayCircle,
  BarChart3,
  MessageSquare,
  Trophy,
  Flame,
  Info
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import SearchAndFilter from "../components/SearchAndFilter";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { NoActivityEmpty } from "../components/EmptyState";

export default function Dashboard() {
  const { user, logout } = useAuth();
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

  console.log("Dashboard component rendering", { user, loading });

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

    // Always enable polling for real-time updates
    pollInterval = setInterval(refreshStats, 10000);

    return () => {
      if (socket) {
        socket.off();
        socket.disconnect();
      }
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  if (loading && !stats.interviewsTaken) {
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
          <section>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Your Dashboard
            </h2>
            <p className={`text-slate-500 mt-2 max-w-2xl ${isDarkMode ? 'text-slate-400' : ''}`}>
              This is your personal interview preparation space.
              Start mock interviews, review feedback, and track growth.
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Interviews Taken", value: stats.interviewsTaken },
              { label: "Average Score", value: `${(stats.averageScore ?? 0)}%` },
              { label: "Current Streak", value: user?.streak || 0, icon: Flame, color: "text-orange-500" },
              { label: "Last Interview", value: stats.lastInterview || "None" },
            ].map((item, i) => (
              <div
                key={i}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl p-6 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {item.icon && <item.icon className={`${item.color} animate-pulse`} size={24} />}
                    <p className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {loading ? "..." : item.value}
                    </p>
                    {item.label === "Current Streak" && <span className="text-xs font-bold text-slate-400 self-end mb-1">DAYS</span>}
                  </div>
                </div>
                {item.label === "Current Streak" && (
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Flame size={100} className="text-orange-500" />
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Actions */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              What would you like to do?
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* CARD */}
              {[
                {
                  icon: PlayCircle,
                  title: "Start a Mock Interview",
                  desc:
                    "Answer real interview-style questions and get structured feedback.",
                  action: "Start interview →",
                  path: "/interview/select",
                  tourId: "start-interview",
                },
                {
                  icon: Trophy,
                  title: "Daily Challenge",
                  desc:
                    "Keep your streak alive! Solve today's technical puzzle.",
                  action: "Play now →",
                  path: "/daily-challenge",
                  tourId: "daily-challenge",
                },
                {
                  icon: BarChart3,
                  title: "View Performance",
                  desc:
                    "Track your scores over time and measure your improvement.",
                  action: "View performance →",
                  path: "/performance",
                  tourId: "performance",
                },
                {
                  icon: MessageSquare,
                  title: "Review Feedback",
                  desc:
                    "Go through detailed feedback from your past interviews.",
                  action: "View feedback →",
                  path: "/feedback",
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(card.path)}
                    data-tour={card.tourId}
                    className={`
                    group cursor-pointer
                    ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white hover:bg-green-50'} rounded-2xl border p-6
                    transition-all duration-300
                    hover:border-green-500
                    hover:shadow-lg
                    hover:-translate-y-1
                  `}
                  >
                    <Icon
                      size={28}
                      className="
                      text-green-600 mb-4
                      transition
                      group-hover:text-green-700
                    "
                    />

                    <h4 className={`
                    text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}
                    group-hover:text-green-700 transition
                  `}>
                      {card.title}
                    </h4>

                    <p className={`
                    ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1
                    ${isDarkMode ? 'group-hover:text-slate-300' : 'group-hover:text-slate-700'} transition
                  `}>
                      {card.desc}
                    </p>

                    <span className="
                    inline-block mt-4 text-green-600 text-sm
                    group-hover:underline
                  ">
                      {card.action}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Recent Activity
            </h3>

            {/* Search and Filter Component */}
            <SearchAndFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              interviews={stats.recentActivity || []}
            />

            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl divide-y border overflow-hidden`}>
              {filteredActivity.length === 0 && (
                stats.recentActivity?.length === 0 ? (
                  <NoActivityEmpty />
                ) : (
                  <p className={`p-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No results match your filters
                  </p>
                )
              )}

              {filteredActivity.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 flex justify-between items-center text-sm ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    } transition`}
                >
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.role || item.type || 'Interview'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      On {item.date}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${parseFloat(item.score) >= 8 ? 'bg-green-50 text-green-700 border border-green-200' :
                    parseFloat(item.score) >= 6 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      parseFloat(item.score) >= 4 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {typeof item.score === 'string' && item.score.includes('/10') ? item.score : item.score ? `${item.score}/10` : "In Progress"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
