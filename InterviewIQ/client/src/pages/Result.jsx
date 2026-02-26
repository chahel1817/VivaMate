import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/themeContext";
import { Home, RotateCcw, TrendingUp, CheckCircle, AlertCircle, Award, Zap } from "lucide-react";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  if (!state) {
    navigate("/dashboard");
    return null;
  }

  const { technicalScore = 0, clarityScore = 0, confidenceScore = 0, feedback = "" } = state;
  const overall = Math.round((technicalScore + clarityScore + confidenceScore) / 3);

  const scores = [
    { label: "Technical", value: technicalScore, color: "from-blue-500 to-cyan-500", bg: isDarkMode ? "bg-blue-900/20 border-blue-800/50" : "bg-blue-50 border-blue-200", text: "text-blue-500", desc: "Accuracy & depth of your answers" },
    { label: "Clarity", value: clarityScore, color: "from-purple-500 to-pink-500", bg: isDarkMode ? "bg-purple-900/20 border-purple-800/50" : "bg-purple-50 border-purple-200", text: "text-purple-500", desc: "How well-structured your answers were" },
    { label: "Confidence", value: confidenceScore, color: "from-orange-500 to-amber-500", bg: isDarkMode ? "bg-orange-900/20 border-orange-800/50" : "bg-orange-50 border-orange-200", text: "text-orange-500", desc: "Tone, pacing & delivery" },
  ];

  const verdict = overall >= 8 ? { label: "Excellent", color: "text-green-400", bg: "bg-green-900/20 border-green-700/30", icon: Award }
    : overall >= 6 ? { label: "Good Job", color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/30", icon: TrendingUp }
      : overall >= 4 ? { label: "Keep Going", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-700/30", icon: AlertCircle }
        : { label: "Needs Work", color: "text-red-400", bg: "bg-red-900/20 border-red-700/30", icon: AlertCircle };

  const VerdictIcon = verdict.icon;

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} py-10 px-4 sm:px-6`}>
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Zap className="w-3.5 h-3.5" /> Interview Complete
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Your Results
            </h1>
          </div>

          {/* Overall Score */}
          <div className={`rounded-2xl border p-8 text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Overall Score</p>
            <div className="relative inline-block mb-4">
              <svg className="w-36 h-36 -rotate-90">
                <circle cx="72" cy="72" r="60" className={`fill-none stroke-2 ${isDarkMode ? 'stroke-slate-700' : 'stroke-slate-200'}`} strokeWidth="10" />
                <circle
                  cx="72" cy="72" r="60"
                  fill="none" strokeWidth="10" strokeLinecap="round"
                  stroke={overall >= 8 ? '#22c55e' : overall >= 6 ? '#3b82f6' : overall >= 4 ? '#f59e0b' : '#ef4444'}
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - overall / 10)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{overall}</span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/10</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${verdict.bg} ${verdict.color}`}>
              <VerdictIcon className="w-4 h-4" /> {verdict.label}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scores.map(s => (
              <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.text}`}>{s.label}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.value}</span>
                  <span className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/10</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                    style={{ width: `${s.value * 10}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className={`rounded-2xl border p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50'}`}>
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Feedback</h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{feedback}</p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 pb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => navigate("/interview/type")}
              className="flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-900/30"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
