import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
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
  Code2,
  Brain,
  Zap,
  Trophy,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Users,
  BookOpen,
  Lightbulb,
  LineChart,
  Info,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
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
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [showInsights, setShowInsights] = useState(true);

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
        improvementRate: Math.round(improvementRate * 100) / 100,
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
    alert('PDF export functionality - Install jsPDF library to enable this feature.');
  };

  const exportToCSV = () => {
    const csvData = analyticsData.recentInterviews.map(interview => ({
      Type: interview.type || 'Interview',
      Date: interview.date,
      Score: interview.score,
      Duration: `${interview.duration || 0} min`
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate advanced metrics - STRICT & REALISTIC ALGORITHM
  const getReadinessScore = () => {
    const avgScore = analyticsData.averageScore; // 0-10 scale
    const totalInterviews = analyticsData.totalInterviews;
    const improvement = analyticsData.improvementRate;
    const skills = analyticsData.skillBreakdown;

    // If no interviews, readiness is 0%
    if (totalInterviews === 0) {
      return 0;
    }

    // Base score calculation (0-100)
    // Average score contributes 50% of readiness
    let baseScore = (avgScore / 10) * 50; // Max 50 points from average score

    // Interview count contributes 30% (need at least 15 interviews for full points)
    let experienceScore = 0;
    if (totalInterviews >= 15) {
      experienceScore = 30;
    } else if (totalInterviews >= 10) {
      experienceScore = 25;
    } else if (totalInterviews >= 7) {
      experienceScore = 20;
    } else if (totalInterviews >= 5) {
      experienceScore = 15;
    } else if (totalInterviews >= 3) {
      experienceScore = 10;
    } else {
      experienceScore = totalInterviews * 3; // 1 interview = 3%, 2 = 6%
    }

    // Skill consistency contributes 15% (all skills should be balanced)
    const skillValues = Object.values(skills);
    const avgSkill = skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length;
    const skillVariance = skillValues.reduce((sum, val) => sum + Math.abs(val - avgSkill), 0) / skillValues.length;
    let consistencyScore = Math.max(0, 15 - (skillVariance * 2)); // Penalize inconsistency

    // Improvement trend contributes 5% (bonus/penalty)
    let improvementBonus = 0;
    if (improvement > 20) improvementBonus = 5;
    else if (improvement > 10) improvementBonus = 3;
    else if (improvement > 0) improvementBonus = 1;
    else if (improvement < -10) improvementBonus = -5;
    else if (improvement < 0) improvementBonus = -2;

    // Calculate total readiness
    let readiness = baseScore + experienceScore + consistencyScore + improvementBonus;

    // Apply strict caps based on performance
    if (avgScore < 5) {
      readiness = Math.min(readiness, 25); // Poor performance caps at 25%
    } else if (avgScore < 6) {
      readiness = Math.min(readiness, 40); // Below average caps at 40%
    } else if (avgScore < 7) {
      readiness = Math.min(readiness, 60); // Average caps at 60%
    } else if (avgScore < 8) {
      readiness = Math.min(readiness, 75); // Good caps at 75%
    }

    // Need minimum interviews for high readiness
    if (totalInterviews < 5) {
      readiness = Math.min(readiness, 35); // Less than 5 interviews caps at 35%
    } else if (totalInterviews < 8) {
      readiness = Math.min(readiness, 55); // Less than 8 interviews caps at 55%
    } else if (totalInterviews < 12) {
      readiness = Math.min(readiness, 75); // Less than 12 interviews caps at 75%
    }

    // To be "Interview Ready" (80%+), you need:
    // - At least 10 interviews
    // - Average score of 8+
    // - All skills above 6
    const allSkillsGood = skillValues.every(skill => skill >= 6);
    if (readiness >= 80 && (!allSkillsGood || avgScore < 8 || totalInterviews < 10)) {
      readiness = 75; // Cap at 75% if requirements not met
    }

    return Math.min(100, Math.max(0, Math.round(readiness)));
  };

  const getStrengthsAndWeaknesses = () => {
    const skills = analyticsData.skillBreakdown;
    const entries = Object.entries(skills).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      value,
      key
    }));

    const sorted = [...entries].sort((a, b) => b.value - a.value);
    return {
      strengths: sorted.slice(0, 2),
      weaknesses: sorted.slice(-2)
    };
  };

  const getPersonalizedRecommendations = () => {
    const score = analyticsData.averageScore;
    const { weaknesses } = getStrengthsAndWeaknesses();
    const totalInterviews = analyticsData.totalInterviews;

    const recommendations = [];

    if (totalInterviews < 5) {
      recommendations.push({
        icon: Target,
        title: "Build Your Foundation",
        description: "Complete at least 5 interviews to get comprehensive analytics",
        action: "Start Interview",
        link: "/interview/select",
        priority: "high"
      });
    }

    if (score < 6) {
      recommendations.push({
        icon: BookOpen,
        title: "Focus on Fundamentals",
        description: "Review core concepts and practice basic interview questions",
        action: "View Resources",
        link: "/forum",
        priority: "high"
      });
    }

    weaknesses.forEach(weakness => {
      recommendations.push({
        icon: Lightbulb,
        title: `Improve ${weakness.name}`,
        description: `Your ${weakness.name} score is ${weakness.value}/10. Practice targeted questions.`,
        action: "Practice Now",
        link: "/daily-challenge",
        priority: "medium"
      });
    });

    if (analyticsData.improvementRate > 10) {
      recommendations.push({
        icon: Trophy,
        title: "You're On Fire!",
        description: `${analyticsData.improvementRate}% improvement! Keep the momentum going.`,
        action: "Continue",
        link: "/interview/select",
        priority: "low"
      });
    }

    return recommendations.slice(0, 4);
  };

  const getPerformanceInsights = () => {
    const trend = analyticsData.performanceTrend;
    if (trend.length < 3) return null;

    const recent = trend.slice(-3);
    const avgRecent = recent.reduce((sum, t) => sum + t.score, 0) / recent.length;
    const older = trend.slice(0, -3);
    const avgOlder = older.length > 0 ? older.reduce((sum, t) => sum + t.score, 0) / older.length : avgRecent;

    const change = avgRecent - avgOlder;

    if (change > 0.5) return { type: 'improving', message: 'Your performance is trending upward! 📈' };
    if (change < -0.5) return { type: 'declining', message: 'Your scores are declining. Time to refocus! 📉' };
    return { type: 'stable', message: 'Your performance is consistent. 📊' };
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
        console.warn("socket.io-client not available, falling back to polling:", err);
      }
    })();

    pollInterval = setInterval(refreshAnalytics, 30000);

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
      <>
        <Navbar />
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading your analytics...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="text-center">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            <button
              onClick={refreshAnalytics}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  const readinessScore = getReadinessScore();
  const { strengths, weaknesses } = getStrengthsAndWeaknesses();
  const recommendations = getPersonalizedRecommendations();
  const performanceInsight = getPerformanceInsights();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                📊 Performance Analytics
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Deep insights into your interview preparation journey
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2.5 rounded-lg border transition-all duration-200 ${isDarkMode
                  ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700 focus:ring-2 focus:ring-green-500'
                  : 'bg-white border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-green-500'
                  }`}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>

              <button
                onClick={exportToCSV}
                className={`px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 ${isDarkMode
                  ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
                  : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={exportToPDF}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Insight Banner */}
        {performanceInsight && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${performanceInsight.type === 'improving'
            ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
            : performanceInsight.type === 'declining'
              ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20'
              : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
            }`}>
            <div className="flex items-center gap-3">
              <Activity size={24} className={
                performanceInsight.type === 'improving' ? 'text-green-600' :
                  performanceInsight.type === 'declining' ? 'text-orange-600' : 'text-blue-600'
              } />
              <p className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {performanceInsight.message}
              </p>
            </div>
          </div>
        )}

        {/* Interview Readiness Score - Hero Section */}
        <div className={`mb-8 p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-slate-700' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-slate-200'
          } shadow-xl`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Interview Readiness Score
              </h2>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                Based on your performance, practice frequency, and improvement rate
              </p>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {readinessScore}%
                </div>
                <div>
                  <div className={`text-sm font-semibold ${readinessScore >= 80 ? 'text-green-600' :
                    readinessScore >= 60 ? 'text-blue-600' :
                      readinessScore >= 40 ? 'text-orange-600' :
                        readinessScore >= 20 ? 'text-red-600' : 'text-red-700'
                    }`}>
                    {readinessScore >= 80 ? '🎯 Interview Ready!' :
                      readinessScore >= 60 ? '� Making Progress' :
                        readinessScore >= 40 ? '💪 Building Foundation' :
                          readinessScore >= 20 ? '🌱 Just Starting' : '🚀 Begin Your Journey'}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {readinessScore >= 80 ? 'Excellent! You\'re well-prepared for real interviews' :
                      readinessScore >= 60 ? 'Good progress! Complete more interviews with 8+ scores' :
                        readinessScore >= 40 ? 'Keep practicing to improve your average score' :
                          readinessScore >= 20 ? 'Complete more interviews to build experience' :
                            'Start your first interview to begin tracking progress'}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-48 h-48">
              <div className="relative w-48 h-48 mx-auto">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className={isDarkMode ? 'text-slate-700' : 'text-slate-200'}
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - readinessScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy size={48} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

      

{/* Metrics Explanation Banner */ }
<div className={`mb-6 p-4 rounded-xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
    }`}>
    <div className="flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                📊 Understanding Your Metrics
            </h4>
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Score Improvement</strong> shows your progress over time, calculated as:
                <code className={`mx-1 px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
                    ((Latest Score - First Score) / First Score) × 100
                </code>
                <br />
                For example: If your first interview scored 6/10 and latest scored 7.5/10, improvement = ((7.5 - 6) / 6) × 100 = <strong>+25%</strong> 📈
            </p>
        </div>
    </div>
</div>



        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Interviews",
              value: analyticsData.totalInterviews,
              icon: BarChart3,
              color: "text-green-600",
              bgColor: "bg-green-100 dark:bg-green-900/30",
              change: null
            },
            {
              label: "Average Score",
              value: `${analyticsData.averageScore.toFixed(1)}/10`,
              icon: Target,
              color: "text-blue-600",
              bgColor: "bg-blue-100 dark:bg-blue-900/30",
              change: analyticsData.improvementRate
            },
            {
              label: "Time Invested",
              value: `${Math.round(analyticsData.totalTimeSpent / 60)}h`,
              icon: Clock,
              color: "text-purple-600",
              bgColor: "bg-purple-100 dark:bg-purple-900/30",
              change: null
            },
            {
              label: "Improvement",
              value: `${analyticsData.improvementRate > 0 ? '+' : ''}${analyticsData.improvementRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: analyticsData.improvementRate >= 0 ? "text-green-600" : "text-red-600",
              bgColor: analyticsData.improvementRate >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
              change: analyticsData.improvementRate
            }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  } rounded-xl border p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon size={24} className={metric.color} />
                  </div>
                  {metric.change !== null && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-slate-500'
                      }`}>
                      {metric.change > 0 ? <ArrowUp size={16} /> : metric.change < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {metric.label}
                </p>
                <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {metric.value}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {index === 0 ? 'Completed mock interviews' :
                    index === 1 ? 'Mean performance score' :
                      index === 2 ? 'Total practice hours' :
                        'First to latest score change'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs Navigation */}
        <div className={`mb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'skills', label: 'Skills Analysis', icon: Brain },
              { id: 'trends', label: 'Performance Trends', icon: LineChart },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-green-600 text-green-600 font-semibold'
                    : `border-transparent ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
                    }`}
                >
                  <TabIcon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Strengths & Weaknesses */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={24} className="text-green-600" />
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Your Strengths
                  </h3>
                </div>
                <div className="space-y-4">
                  {strengths.map((strength, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold capitalize ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                          {strength.name}
                        </span>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {strength.value.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-1000"
                          style={{ width: `${(strength.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} className="text-orange-600" />
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Areas to Improve
                  </h3>
                </div>
                <div className="space-y-4">
                  {weaknesses.map((weakness, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold capitalize ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                          {weakness.name}
                        </span>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          {weakness.value.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 rounded-full transition-all duration-1000"
                          style={{ width: `${(weakness.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Topic Distribution */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Interview Topic Distribution
                </h3>
                <PieChart size={20} className="text-green-500" />
              </div>

              <div className="space-y-4">
                {analyticsData.recentInterviews.length > 0 ? (
                  Array.from(new Set(analyticsData.recentInterviews.map(i => i.type || 'Interview'))).map((topic, index) => {
                    const count = analyticsData.recentInterviews.filter(i => (i.type || 'Interview') === topic).length;
                    const percentage = (count / analyticsData.recentInterviews.length) * 100;
                    const colors = [
                      { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100 dark:bg-green-900/30' },
                      { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100 dark:bg-blue-900/30' },
                      { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30' },
                      { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100 dark:bg-orange-900/30' }
                    ];
                    const colorSet = colors[index % colors.length];

                    return (
                      <div key={topic} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colorSet.light}`}>
                              <Code2 size={18} className={colorSet.text} />
                            </div>
                            <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                              {topic}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {count} session{count > 1 ? 's' : ''}
                            </span>
                            <span className={`text-sm font-semibold ${colorSet.text}`}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div
                            className={`h-full ${colorSet.bg} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <PieChart size={48} className={`mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Complete more interviews to see your topic distribution
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Detailed Skill Breakdown
            </h3>
            <div className="space-y-6">
              {Object.entries(analyticsData.skillBreakdown).map(([skill, score]) => {
                const percentage = (score / 10) * 100;
                const isStrong = score >= 7;
                const isWeak = score < 5;

                return (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isStrong ? 'bg-green-100 dark:bg-green-900/30' :
                          isWeak ? 'bg-orange-100 dark:bg-orange-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                          <Brain size={20} className={
                            isStrong ? 'text-green-600' :
                              isWeak ? 'text-orange-600' :
                                'text-blue-600'
                          } />
                        </div>
                        <span className={`capitalize font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-sm px-3 py-1 rounded-full font-semibold ${isStrong ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          isWeak ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                          {isStrong ? 'Strong' : isWeak ? 'Needs Work' : 'Good'}
                        </div>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                    <div className={`w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isStrong ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          isWeak ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isStrong ? '✨ Excellent! Keep it up.' :
                        isWeak ? '💪 Focus on improving this area.' :
                          '📈 You\'re doing well, keep practicing.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Performance Over Time
            </h3>
            {analyticsData.performanceTrend.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.performanceTrend.map((trend, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trend.score >= 8 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                        trend.score >= 6 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                          'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        }`}>
                        <Award size={24} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Interview #{idx + 1}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(trend.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${trend.score >= 8 ? 'bg-green-600' :
                            trend.score >= 6 ? 'bg-blue-600' :
                              'bg-orange-600'
                            }`}
                          style={{ width: `${(trend.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-2xl font-bold ${trend.score >= 8 ? 'text-green-600' :
                        trend.score >= 6 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                        {trend.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <LineChart size={48} className={`mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Complete more interviews to see your performance trends
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-xl border p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Zap size={24} className="text-purple-600" />
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Personalized Recommendations
                </h3>
              </div>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Based on your performance analysis, here's what you should focus on next
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => {
                const RecIcon = rec.icon;
                return (
                  <div
                    key={idx}
                    className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 hover:shadow-xl transition-all duration-300 ${rec.priority === 'high' ? 'ring-2 ring-green-500' : ''
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${rec.priority === 'high' ? 'bg-green-100 dark:bg-green-900/30' :
                        rec.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                        <RecIcon size={24} className={
                          rec.priority === 'high' ? 'text-green-600' :
                            rec.priority === 'medium' ? 'text-blue-600' :
                              'text-purple-600'
                        } />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {rec.title}
                          </h4>
                          {rec.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                              Priority
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {rec.description}
                        </p>
                        <Link
                          to={rec.link}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${rec.priority === 'high'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : isDarkMode
                              ? 'bg-slate-700 text-white hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                            }`}
                        >
                          {rec.action}
                          <ArrowUp size={16} className="rotate-45" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Community Forum Link */}
        <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} rounded-xl border p-6 mt-8`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Join the Community
                </h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Share tips, ask questions, and learn from other interview candidates
                </p>
              </div>
            </div>
            <Link
              to="/forum"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <MessageSquare size={20} />
              Visit Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
