import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Award,
  Calendar,
  Filter
} from "lucide-react";
import api from "../services/api";

export default function Analytics() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [analyticsData, setAnalyticsData] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    improvementRate: 0,
    skillBreakdown: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      behavioral: 0
    },
    performanceTrend: [],
    recentInterviews: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const refreshAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setAnalyticsData(res.data);
    } catch (e) {
      console.error('refreshAnalytics error', e);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        await refreshAnalytics();
      } catch (e) {
        console.error('fetchAnalytics error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    let socket;
    let pollInterval;

    (async () => {
      try {
        const mod = await import("socket.io-client");
        const io = mod?.default ?? mod;
        const socketUrl = "http://localhost:5000";
        socket = io(socketUrl, { transports: ["websocket"] });
        socket.on("connect", () => console.debug("socket connected"));
        socket.on("session:updated", () => refreshAnalytics());
        socket.on("disconnect", () => console.debug("socket disconnected"));
      } catch (err) {
        console.warn(
          "socket.io-client not available, falling back to polling:",
          err
        );
      }
    })();

    // Always enable polling for real-time updates
    pollInterval = setInterval(refreshAnalytics, 10000);

    return () => {
      if (socket) {
        socket.off();
        socket.disconnect();
      }
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [timeRange]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-white border-slate-300'
                }`}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Track your interview preparation progress and performance insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Total Interviews</p>
                <p className="text-3xl font-bold text-green-600">{analyticsData?.totalInterviews}</p>
              </div>
              <BarChart3 size={24} className="text-green-600" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Average Score</p>
                <p className="text-3xl font-bold text-blue-600">{analyticsData?.averageScore}/10</p>
              </div>
              <Target size={24} className="text-blue-600" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Time Spent</p>
                <p className="text-3xl font-bold text-purple-600">{Math.round(analyticsData?.totalTimeSpent / 60)}h</p>
              </div>
              <Clock size={24} className="text-purple-600" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Improvement</p>
                <p className="text-3xl font-bold text-orange-600">+{analyticsData?.improvementRate}%</p>
              </div>
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Trend Chart */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className="text-xl font-semibold mb-4">Performance Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData?.performanceTrend.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                    style={{ height: `${(point.score / 10) * 100}%` }}
                  ></div>
                  <span className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className="text-xl font-semibold mb-4">Skill Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData?.skillBreakdown || {}).map(([skill, score]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 mt-8`}>
          <h3 className="text-xl font-semibold mb-4">Recent Interviews</h3>
          <div className="space-y-4">
            {analyticsData?.recentInterviews.map((interview) => (
              <div key={interview.id} className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    interview.score >= 8 ? 'bg-green-100 text-green-600' :
                    interview.score >= 7 ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">{interview.type} Interview</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(interview.date).toLocaleDateString()} • {interview.duration} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    interview.score >= 8 ? 'text-green-600' :
                    interview.score >= 7 ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {interview.score}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
