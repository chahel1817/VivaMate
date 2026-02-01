import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTheme } from "../context/themeContext";

export default function InterviewSummary() {
  const [summary, setSummary] = useState(null);
  const reportRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const loadSummary = async () => {
      const res = await api.get("/interview/summary");
      setSummary(res.data);
    };
    loadSummary();
  }, []);

  // Prevent back navigation to interview page
  useEffect(() => {
    // Replace current history entry so back button goes to dashboard
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      // Prevent default back behavior
      window.history.pushState(null, '', window.location.href);
      // Navigate to dashboard instead
      navigate('/dashboard', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("Interview_Report.pdf");
  };

  if (!summary) {
    return (
      <>
        <Navbar />
        <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
          Generating interview insights...
        </div>
      </>
    );
  }

  /* ================= CHART DATA ================= */
  const scoreData = [
    { skill: "Technical", value: summary.averageTechnical || summary.overallScore || 0 },
    { skill: "Clarity", value: summary.averageClarity || 0 },
    { skill: "Confidence", value: summary.averageConfidence || 0 },
  ];

  const interviewType = summary.topic
    ? `${summary.topic.domain || ''} ${summary.topic.tech || ''} (${summary.difficulty || ''})`.trim()
    : summary.interviewType || 'Mock Interview';

  return (
    <>
      <Navbar />

      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} p-8`}>
        <div className="max-w-6xl mx-auto space-y-8" ref={reportRef}>

          {/* HEADER */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-8 shadow ${isDarkMode ? 'border' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Interview Analysis Report
                </h1>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-2 max-w-2xl`}>
                  A detailed evaluation of your interview results with
                  insights, analytics, and improvement guidance.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`px-4 py-2 rounded-lg border text-sm ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Overall Score" value={`${summary.overallScore || 0}/10`} isDarkMode={isDarkMode} />
            <StatCard title="Interview Type" value={interviewType} isDarkMode={isDarkMode} />
            <StatCard
              title="Consistency Score"
              value={summary.consistencyScore != null ? `${summary.consistencyScore}/10` : "N/A"}
              isDarkMode={isDarkMode}
            />
            <StatCard title="Recommendation" value={summary.recommendation || "Pending"} highlight isDarkMode={isDarkMode} />
          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* RADAR */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-6 shadow ${isDarkMode ? 'border' : ''}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Skill Radar Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={scoreData}>
                  <PolarGrid stroke={isDarkMode ? '#475569' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} />
                  <Radar
                    dataKey="value"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* BAR */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-6 shadow ${isDarkMode ? 'border' : ''}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreData}>
                  <XAxis dataKey="skill" tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0' }} />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <div className="grid md:grid-cols-2 gap-6">
            <InsightBox
              title="Strengths"
              items={summary.strengths || []}
              color="green"
              isDarkMode={isDarkMode}
            />
            <InsightBox
              title="Areas for Improvement"
              items={summary.weaknesses || []}
              color="yellow"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* CONSISTENCY NOTE */}
          {summary.consistencyNote && (
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Interview Consistency Insight</h3>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>{summary.consistencyNote}</p>
            </div>
          )}

          {/* SKILL HEATMAP */}
          {summary.skillMetrics && summary.skillMetrics.length > 0 && (
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-6 shadow ${isDarkMode ? 'border' : ''}`}>
              <h3 className={`font-semibold mb-4 text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Skill Heatmap</h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
                Your performance across different topics based on technical scores.
              </p>
              <div className="space-y-3">
                {summary.skillMetrics.map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.skill}</span>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                        {s.averageScore.toFixed(1)}/10 · {s.count} question{s.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2 overflow-hidden`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                        style={{ width: `${Math.min(100, (s.averageScore / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PER-QUESTION FEEDBACK */}
          {summary.perQuestionFeedback && summary.perQuestionFeedback.length > 0 && (
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-6 shadow ${isDarkMode ? 'border' : ''}`}>
              <h3 className={`font-semibold mb-4 text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Question-by-Question Feedback</h3>
              <div className="space-y-6">
                {summary.perQuestionFeedback.map((item, index) => (
                  <div key={index} className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pb-4 last:border-0`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Question {index + 1}</h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">Tech: {item.technicalScore || 0}/10</span>
                        <span className="text-green-600">Clarity: {item.clarityScore || 0}/10</span>
                        <span className="text-purple-600">Confidence: {item.confidenceScore || 0}/10</span>
                      </div>
                    </div>
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}><strong>Q:</strong> {item.question}</p>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}><strong>A:</strong> {item.answer}</p>
                    {item.feedback && (
                      <p className={`${isDarkMode ? 'text-slate-300 bg-slate-700' : 'text-slate-700 bg-slate-50'} mt-2 p-3 rounded-lg`}>
                        <strong>Feedback:</strong> {item.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, highlight, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow ${highlight
        ? isDarkMode ? "bg-green-900/30 border border-green-700" : "bg-green-50 border border-green-400"
        : isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}
    >
      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-1`}>{value}</p>
    </div>
  );
}

function InsightBox({ title, items, color, isDarkMode }) {
  const dotColor = color === "green" ? "text-green-600" : "text-yellow-600";

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl p-6 shadow ${isDarkMode ? 'border' : ''}`}>
      <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <ul className={`space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={dotColor}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
