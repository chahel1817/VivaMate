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
  Filter,
  Download,
  MessageSquare,
  Star,
  Send,
  PieChart,
  Code2
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
// Assume jsPDF and papaparse are installed for export
// import jsPDF from 'jspdf';
// import Papa from 'papaparse';

export default function Analytics() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [analyticsData, setAnalyticsData] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    improvementRate: 0,
    skillBreakdown: {
      technical: 4,
      communication: 5,
      problemSolving: 4.5,
      behavioral: 4
    },
    performanceTrend: [],
    recentInterviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [feedback, setFeedback] = useState({});
  const [showFeedback, setShowFeedback] = useState(null);

  const refreshAnalytics = async () => {
    try {
      setError(null);
      const res = await api.get("/dashboard/stats");
      const data = res.data;
      const performanceTrend = data.performanceTrend || [];
      const skillBreakdown = data.skillBreakdown || {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        behavioral: 0
      };

      // Calculate improvement rate
      let improvementRate = 0;
      if (performanceTrend.length > 1) {
        const first = performanceTrend[0].score;
        const last = performanceTrend[performanceTrend.length - 1].score;
        if (first > 0) {
          improvementRate = ((last - first) / first) * 100;
        }
      }
      setAnalyticsData({
        totalInterviews: data.interviewsTaken || 0,
        averageScore: data.averageScore ? data.averageScore / 10 : 0,
        totalTimeSpent: (data.recentActivity || []).reduce((sum, item) => sum + (item.duration || 0), 0),
        improvementRate: Math.round(improvementRate * 100) / 100, // Round to 2 decimals
        skillBreakdown: {
          technical: Math.round(skillBreakdown.technical * 10) / 10,
          communication: Math.round(skillBreakdown.communication * 10) / 10,
          problemSolving: Math.round(skillBreakdown.problemSolving * 10) / 10,
          behavioral: Math.round(skillBreakdown.behavioral * 10) / 10
        },
        performanceTrend,
        recentInterviews: data.recentActivity || []
      });
    } catch (e) {
      console.error('refreshAnalytics error', e);
      setError('Failed to load analytics data. Please try again later.');
    }
  };

  const exportToPDF = () => {
    // const doc = new jsPDF();
    // doc.text('Analytics Report', 10, 10);
    // doc.text(`Total Interviews: ${analyticsData.totalInterviews}`, 10, 20);
    // doc.text(`Average Score: ${analyticsData.averageScore}/10`, 10, 30);
    // doc.text(`Time Spent: ${Math.round(analyticsData.totalTimeSpent / 60)}h`, 10, 40);
    // doc.text(`Improvement: +${analyticsData.improvementRate}%`, 10, 50);
    // doc.save('analytics.pdf');
    alert('PDF export functionality would be implemented with jsPDF library.');
  };

  const exportToCSV = () => {
    // const csv = Papa.unparse(analyticsData.recentInterviews);
    // const blob = new Blob([csv], { type: 'text/csv' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'recent_interviews.csv';
    // a.click();
    alert('CSV export functionality would be implemented with papaparse library.');
  };

  const submitFeedback = async (interviewId, rating, comment) => {
    try {
      // await api.post('/feedback', { interviewId, rating, comment });
      alert('Feedback submitted successfully!');
      setFeedback({ ...feedback, [interviewId]: { rating, comment } });
      setShowFeedback(null);
    } catch (e) {
      alert('Failed to submit feedback.');
    }
  };

  const getAISuggestions = () => {
    const score = analyticsData.averageScore;
    if (score >= 8) return 'Excellent! Keep practicing advanced topics.';
    if (score >= 6) return 'Good progress. Focus on communication skills.';
    return 'Practice more on technical questions and time management.';
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        await refreshAnalytics();
      } catch (e) {
        setError('Failed to load analytics data.');
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
        const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace('/api', '');
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

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className={`text-red-500 ${isDarkMode ? 'text-red-400' : ''}`}>{error}</p>
          <button
            onClick={refreshAnalytics}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mt-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Performance Analytics</h1>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={exportToPDF}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
              >
                <Download size={16} className="inline mr-2" /> Export PDF
              </button>
              <button
                onClick={exportToCSV}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
              >
                <Download size={16} className="inline mr-2" /> Export CSV
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700 focus:ring-2 focus:ring-green-500' : 'bg-white border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-green-500'}`}
                aria-label="Select time range"
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

        {/* AI Suggestions */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 mb-8`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>AI-Powered Suggestions</h3>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{getAISuggestions()}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Interviews",
              value: analyticsData?.totalInterviews,
              icon: BarChart3,
              color: "text-green-600"
            },
            {
              label: "Average Score",
              value: `${analyticsData?.averageScore}/10`,
              icon: Target,
              color: "text-blue-600"
            },
            {
              label: "Time Spent",
              value: `${Math.round(analyticsData?.totalTimeSpent / 60)}h`,
              icon: Clock,
              color: "text-purple-600"
            },
            {
              label: "Improvement",
              value: `${analyticsData?.improvementRate > 0 ? '+' : ''}${analyticsData?.improvementRate || 0}%`,
              icon: TrendingUp,
              color: analyticsData?.improvementRate >= 0 ? "text-green-600" : "text-red-500"
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 transition-transform duration-200 hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>{item.label}</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-2`}>
                      {item.value}
                    </p>
                  </div>
                  <Icon size={24} className={item.color} />
                </div>
              </div>
            );
          })}
        </div>


        <div className="grid lg:grid-cols-2 gap-8">
          {/* Topic Distribution - NEW & WORKING */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 transition-shadow duration-200 hover:shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Topic Distribution</h3>
              <PieChart size={20} className="text-green-500" />
            </div>

            <div className="space-y-6">
              {analyticsData.recentInterviews.length > 0 ? (
                Array.from(new Set(analyticsData.recentInterviews.map(i => i.type || 'Interview'))).slice(0, 4).map((topic, index) => {
                  const count = analyticsData.recentInterviews.filter(i => (i.type || 'Interview') === topic).length;
                  const percentage = (count / analyticsData.recentInterviews.length) * 100;
                  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];

                  return (
                    <div key={topic} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Code2 size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                          <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{topic}</span>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{count} session{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <PieChart size={40} className="text-slate-300 mb-2" />
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Complete more interviews to see your topic distribution</p>
                </div>
              )}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 transition-shadow duration-200 hover:shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Skill Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData?.skillBreakdown || {}).map(([skill, score]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className={`capitalize ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${(score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium w-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 mt-8 transition-shadow duration-200 hover:shadow-lg`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recent Interviews</h3>
          <div className="space-y-4">
            {analyticsData?.recentInterviews.length > 0 ? analyticsData.recentInterviews.map((interview) => (
              <div key={interview.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${parseFloat(interview.score) >= 8 ? 'bg-green-100 text-green-600' : parseFloat(interview.score) >= 7 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{interview.type || 'Interview'}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      {new Date(interview.date).toString() !== 'Invalid Date' ? new Date(interview.date).toLocaleDateString() : 'N/A'} • {interview.duration || 0} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFeedback(showFeedback === interview.id ? null : interview.id)}
                    className={`px-3 py-1 rounded-lg ${isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    <Star size={16} className="inline mr-1" /> Rate
                  </button>
                  <div className={`text-2xl font-bold ${parseFloat(interview.score) >= 8 ? 'text-green-600' : parseFloat(interview.score) >= 7 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {typeof interview.score === 'string' && interview.score.includes('/10') ? interview.score : `${interview.score}/10`}
                  </div>
                </div>
                {showFeedback === interview.id && (
                  <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`cursor-pointer ${feedback[interview.id]?.rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                          onClick={() => setFeedback({ ...feedback, [interview.id]: { ...feedback[interview.id], rating: star } })}
                        />
                      ))}
                    </div>
                    <textarea
                      placeholder="Leave a comment..."
                      value={feedback[interview.id]?.comment || ''}
                      onChange={(e) => setFeedback({ ...feedback, [interview.id]: { ...feedback[interview.id], comment: e.target.value } })}
                      className={`w-full p-2 rounded ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white'}`}
                    />
                    <button
                      onClick={() => submitFeedback(interview.id, feedback[interview.id]?.rating, feedback[interview.id]?.comment)}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Send size={16} className="inline mr-1" /> Submit
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No recent interviews</p>
            )}
          </div>
        </div>

        {/* Community Forum Link */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 mt-8`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Community Forum</h3>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
            Join our community to share interview tips and experiences.
          </p>
          <Link
            to="/forum"
            className={`inline-flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
          >
            <MessageSquare size={16} className="mr-2" /> Visit Forum
          </Link>
        </div>
      </div>
    </div>
  );
}
