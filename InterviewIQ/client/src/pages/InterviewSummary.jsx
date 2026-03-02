import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts";
import { Download, ChevronLeft, Target, Award, Zap, Brain, MessageSquare, TrendingUp, CheckCircle2, AlertCircle, FileText, ArrowRight } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function InterviewSummary() {
  const [summary, setSummary] = useState(null);
  const reportRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const url = id ? `/interview/summary/${id}` : "/interview/summary";
        const res = await api.get(url);
        setSummary(res.data);
      } catch (err) {
        console.error("Error loading summary:", err);
      }
    };
    loadSummary();
  }, [id]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.href);
      navigate('/dashboard', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#080d18" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`VivaMate_Report_${id || 'latest'}.pdf`);
  };

  const CountUp = ({ end }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTime;
      const duration = 2000;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        setCount((easeOutExpo * end).toFixed(1));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, [end]);
    return <span className="text-7xl font-black text-white">{count}</span>;
  };

  if (!summary) {
    return (
      <div className="min-h-screen bg-[#080d18] flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full mb-4"
        />
        <p className="text-slate-400 font-medium animate-pulse">Generating your performance insights...</p>
      </div>
    );
  }

  const scoreData = [
    { skill: "Technical", value: summary.averageTechnical || summary.overallScore || 0, full: 10, icon: <TrendingUp size={14} />, tooltip: "Evaluates your domain knowledge and implementation details." },
    { skill: "Clarity", value: summary.averageClarity || 0, full: 10, icon: <MessageSquare size={14} />, tooltip: "Measures how effectively you communicate complex ideas." },
    { skill: "Confidence", value: summary.averageConfidence || 0, full: 10, icon: <Target size={14} />, tooltip: "Reflects your poise and certainty during the explanation." },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-200 selection:bg-green-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-10"
          ref={reportRef}
        >
          {/* HEADER / NAVIGATION BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em]"
            >
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ChevronLeft size={14} />
              </div>
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={downloadPDF}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm"
              >
                <Download size={16} />
                Export
              </button>
              <Link
                to="/interview/setup"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-green-900/40"
              >
                Practice Again
              </Link>
            </div>
          </div>

          <div className="space-y-12">
            {/* 1. PRIMARY HEADER: TITLE & GROWTH */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Interview <span className="text-green-500">Summary</span>
              </h1>

              {summary.previousScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`group/growth self-start sm:self-center px-4 py-2 border rounded-2xl flex items-center gap-3 transition-all duration-500 hover:scale-[1.03] backdrop-blur-md ${summary.growthDelta > 0 ? 'bg-green-500/10 border-green-500/20 shadow-xl shadow-green-900/10' :
                    summary.growthDelta < -0.8 ? 'bg-red-500/10 border-red-500/20 shadow-xl shadow-red-900/10' :
                      summary.growthDelta < 0 ? 'bg-amber-500/10 border-amber-500/20 shadow-xl shadow-amber-900/10' :
                        'bg-white/5 border-white/10'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${summary.growthDelta > 0 ? 'bg-green-500/20 text-green-400' :
                    summary.growthDelta < -0.8 ? 'bg-red-500/20 text-red-500' :
                      summary.growthDelta < 0 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-slate-500/10 text-slate-400'
                    }`}>
                    <TrendingUp size={16} className={summary.growthDelta < 0 ? "rotate-180" : ""} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">
                      {summary.growthDelta > 0 ? `+${summary.growthDelta} Higher` :
                        summary.growthDelta < 0 ? `${summary.growthDelta} Momentum` : "Stable"}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">vs last attempt</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. INSIGHTS ROW: VERDICT & QUICK GAINS (PERFECTLY ALIGNED) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* EXPERT VERDICT (8 COLUMNS) */}
              <div className="lg:col-span-8">
                <div className="flex items-start gap-4 text-slate-400 font-bold text-sm max-w-4xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Award size={20} className="text-amber-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/60 leading-none">Expert Verdict</span>
                    <div className="text-white/90 font-medium leading-relaxed text-sm md:text-base border-l-2 border-white/10 pl-5 py-0.5">
                      {summary.overallScore >= 8 ? (
                        "You demonstrate mastery of core concepts and high implementation precision. Answers are structured, confident, and technically sound."
                      ) : summary.overallScore >= 6.5 ? (
                        "Strong conceptual understanding, but some technical areas could benefit from more implementation-level precision."
                      ) : summary.overallScore >= 5 ? (
                        "Great potential and consistent delivery, though there's a need to bridge the gap between knowing the concept and articulating it."
                      ) : (
                        "Foundations are present, but focusing on technical implementation details and clarity will significantly boost your performance."
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK GAINS (4 COLUMNS) */}
              <div className="lg:col-span-4 space-y-4 pt-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 leading-none">Quick Gains</h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  {(summary.weaknesses || []).slice(0, 2).map((win, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 5 }}
                      onClick={() => document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group text-left px-4 py-3 bg-white/[0.03] border border-white/5 hover:border-green-500/30 rounded-xl flex items-center gap-4 transition-all"
                    >
                      <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center text-green-500 font-black text-[10px] group-hover:bg-green-500 group-hover:text-black transition-colors shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-[11px] text-white/80 font-bold leading-snug group-hover:text-green-400 truncate transition-colors capitalize">{win}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-8">
              <motion.div variants={itemVariants} className="relative group">
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-10 inset-y-20 bg-green-500/20 blur-[80px] rounded-full group-hover:bg-green-500/30 transition-colors pointer-events-none"
                />
                <div className="relative bg-[#0d1117]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center overflow-hidden transition-all duration-500 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-900/10 group/card">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/card:opacity-10 transition-opacity">
                    <Target size={140} />
                  </div>
                  <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.25em] mb-6">Overall Performance</span>
                  <div className="relative mb-8 p-4">
                    <div className="absolute inset-0 rounded-full bg-green-500/5 blur-xl group-hover/card:bg-green-500/10 transition-colors" />
                    <svg className="w-52 h-52 transform -rotate-90 relative z-10">
                      <circle cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                      <motion.circle
                        cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="14" fill="transparent"
                        strokeDasharray={2 * Math.PI * 92}
                        initial={{ strokeDashoffset: 2 * Math.PI * 92 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 92) * (1 - (summary.overallScore || 0) / 10) }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                        className="text-green-500"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 12px rgba(34, 197, 94, 0.4))" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <div className="flex items-baseline">
                        <CountUp end={summary.overallScore || 0} />
                        <span className="text-xl font-bold text-slate-600 ml-0.5 opacity-60">/10</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 max-w-[120px] leading-tight">
                        {summary.overallScore >= 7.5 ? "Mastery Level" :
                          summary.overallScore >= 5 ? "Strong Foundation — refine clarity & depth" :
                            "Great Start — keep pushing for technical precision"}
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 px-8 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-black uppercase tracking-[0.15em] mb-6 shadow-lg shadow-green-900/10">
                    {summary.recommendation || "Needs Practice"}
                  </div>
                  <p className="relative z-10 text-slate-400 text-sm leading-relaxed italic max-w-[240px]">
                    "{summary.consistencyNote || "Consistency is key to a perfect interview."}"
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="bg-[#161b22]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all hover:bg-[#161b22] hover:border-white/10 group">
                  <Brain className="text-purple-400 mb-3 transition-transform group-hover:scale-110" size={24} />
                  <span className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tech Stack</span>
                  <span className="text-white font-bold">{summary.topic?.tech || "General"}</span>
                </div>
                <div className="bg-[#161b22]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all hover:bg-[#161b22] hover:border-white/10 group">
                  <TrendingUp className="text-blue-400 mb-3 transition-transform group-hover:scale-110" size={24} />
                  <span className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Difficulty</span>
                  <span className="text-white font-bold capitalize">{summary.difficulty || "Medium"}</span>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <motion.div variants={itemVariants} className="bg-[#0d1117]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-black/40 transition-all hover:border-white/20">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Skill Analysis</h3>
                    <p className="text-sm text-slate-500">Breaking down your technical and soft skills.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="h-[320px] w-full relative">
                    <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={scoreData} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis
                          dataKey="skill"
                          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                        />
                        <PolarRadiusAxis domain={[0, 10]} axisLine={false} tick={false} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#22c55e"
                          fill="url(#radarGradient)"
                          fillOpacity={0.8}
                          animationBegin={600}
                          animationDuration={2000}
                          style={{ filter: "drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))" }}
                        />
                        <defs>
                          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 md:pl-4 max-w-[340px] md:ml-auto w-full">
                    {scoreData.map((s, i) => (
                      <div key={i} className="group">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-2 group/label relative">
                            <div className="text-green-500/80 group-hover:text-green-400 transition-colors">
                              {s.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{s.skill}</span>
                            {/* Mini Tooltip */}
                            <div className="absolute left-0 -top-8 px-2 py-1 bg-black/90 border border-white/10 rounded text-[9px] text-slate-300 font-bold whitespace-nowrap opacity-0 group-hover/label:opacity-100 transition-opacity pointer-events-none z-50">
                              {s.tooltip}
                            </div>
                          </div>
                          <span className="text-sm font-black text-white">{s.value}/10</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[3px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.value / 10) * 100}%` }}
                            transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-green-300 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/5 backdrop-blur-xl border border-green-500/20 rounded-[2rem] p-8 transition-all hover:bg-green-500/10 hover:border-green-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 size={22} className="text-green-500" />
                    <h4 className="text-lg font-bold text-white tracking-tight">Top Strengths</h4>
                  </div>
                  <ul className="space-y-4">
                    {(summary.strengths || []).map((s, i) => (
                      <li key={i} className="flex gap-3 items-start text-slate-300 text-sm leading-relaxed">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-8 transition-all hover:bg-amber-500/10 hover:border-amber-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle size={22} className="text-amber-500" />
                    <h4 className="text-lg font-bold text-white tracking-tight">Growth Areas</h4>
                  </div>
                  <ul className="space-y-4">
                    {(summary.weaknesses || []).map((w, i) => (
                      <li key={i} className="flex gap-3 items-start text-slate-300 text-sm leading-relaxed">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div id="explorer" variants={itemVariants} className="bg-[#0d1117]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl scroll-mt-10">
            <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Answer Explorer</h3>
                  <p className="text-sm text-slate-500">Dive deep into every response and coach feedback.</p>
                </div>
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar">
              {(summary.perQuestionFeedback || []).map((item, idx) => (
                <QuestionItem key={idx} item={item} index={idx} />
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform">
              <Award size={160} />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-black text-white mb-4 italic">The Journey Doesn't End Here</h3>
              <p className="text-green-50 mb-8 opacity-90 leading-relaxed">
                Consistency is the secret sauce of successful interviewees. Try another session in a different domain to broaden your skills and climb the leaderboard!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/interview/setup" className="bg-white text-green-700 px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-green-50 transition-all flex items-center gap-2">
                  Next Challenge <ArrowRight size={20} />
                </Link>
                <Link to="/leaderboard" className="bg-black/20 hover:bg-black/30 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-lg backdrop-blur-sm transition-all flex items-center gap-2">
                  View Leaderboard
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffffff10; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ffffff20; }
      `}} />
    </div>
  );
}

function QuestionItem({ item, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-[2rem] border transition-all duration-300 ${isOpen ? 'bg-[#161b22] border-white/10' : 'bg-transparent border-white/[0.03] hover:border-white/10'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 md:p-8 flex items-start gap-4 md:gap-6"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 font-black flex-shrink-0 border border-white/5">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-2 leading-tight pr-8">{item.question}</h4>
          <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-500"><Brain size={12} /> Tech: {item.technicalScore}/10</span>
            <span className="flex items-center gap-1.5 text-green-500"><Zap size={12} /> Clarity: {item.clarityScore}/10</span>
            <span className="flex items-center gap-1.5 text-purple-500"><Target size={12} /> Confidence: {item.confidenceScore}/10</span>
          </div>
        </div>
        <div className={`mt-2 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronLeft className="-rotate-90" size={24} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-8 pt-2 space-y-6">
              <div className="space-y-4">
                <div className="bg-[#080d12] border border-white/5 rounded-2xl p-6">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={12} /> Your Response
                  </div>
                  <p className="text-slate-300 text-sm italic leading-relaxed">"{item.answer || "No response recorded."}"</p>
                </div>
                <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-6 relative">
                  <div className="text-[10px] font-bold text-green-500/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare size={12} /> AI Feedback
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {item.feedback || "Excellent answer. No further improvements suggested."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
