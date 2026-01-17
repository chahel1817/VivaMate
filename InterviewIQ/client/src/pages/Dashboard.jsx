import {
  PlayCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import SearchAndFilter from "../components/SearchAndFilter";
import Navbar from "../components/Navbar";
import api from "../services/api";

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

  useEffect(() => {
    refreshStats();
    let socket;
    let pollInterval;

    (async () => {
      try {
        const mod = await import("socket.io-client");
        const io = mod?.default ?? mod;
        const socketUrl =
          process.env.REACT_APP_API_URL || "http://localhost:5000";
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

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100'} px-6 py-10`}>
        <div className="max-w-6xl mx-auto space-y-12">
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
          <section className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Interviews Taken", value: stats.interviewsTaken },
              { label: "Average Score", value: `${(stats.averageScore ?? 0)}%` },
              { label: "Last Interview", value: stats.lastInterview || "None" },
            ].map((item, i) => (
              <div
                key={i}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl p-6`}
              >
                <h3 className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</h3>
                <p className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-2`}>
                  {loading ? "..." : item.value}
                </p>
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
                },
                {
                  icon: BarChart3,
                  title: "View Performance",
                  desc:
                    "Track your scores over time and measure your improvement.",
                  action: "View performance →",
                  path: "/performance",
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
                <p className={`p-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stats.recentActivity?.length === 0 ? "No activity yet" : "No results match your filters"}
                </p>
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
