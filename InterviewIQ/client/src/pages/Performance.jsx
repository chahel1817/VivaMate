import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Performance() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pollInterval;
    const fetchResponses = async () => {
      try {
        const res = await api.get("/responses");
        setResponses(res.data);
      } catch (err) {
        alert("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    pollInterval = setInterval(fetchResponses, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  // 🔢 Calculate averages
  const avg = (key) => {
    if (responses.length === 0) return 0;
    return (
      responses.reduce((sum, r) => sum + (r.scores?.[key] || 0), 0) /
      responses.length
    ).toFixed(1);
  };

  // 📈 Chart data
  const chartData = responses
    .slice()
    .reverse()
    .map((r, index) => ({
      attempt: `#${index + 1}`,
      technical: r.scores?.technical || 0,
      clarity: r.scores?.clarity || 0,
      confidence: r.scores?.confidence || 0,
    }));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading performance...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className="max-w-6xl mx-auto space-y-10">

          {/* HEADER */}
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Performance Analytics
          </h2>

          {/* AVERAGE SCORES */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Technical", value: avg("technical") },
              { label: "Clarity", value: avg("clarity") },
              { label: "Confidence", value: avg("confidence") },
            ].map((item, i) => (
              <div
                key={i}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 text-center`}
              >
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                <p className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-2`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* LINE CHART */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4`}>
              Improvement Over Time
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e2e8f0'} />
                <XAxis dataKey="attempt" stroke={isDarkMode ? '#cbd5e1' : '#64748b'} />
                <YAxis stroke={isDarkMode ? '#cbd5e1' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#ffffff' : '#000000' }} />
                <Line type="monotone" dataKey="technical" stroke="#16a34a" />
                <Line type="monotone" dataKey="clarity" stroke="#0284c7" />
                <Line type="monotone" dataKey="confidence" stroke="#9333ea" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4`}>
              Score Breakdown
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e2e8f0'} />
                <XAxis dataKey="attempt" stroke={isDarkMode ? '#cbd5e1' : '#64748b'} />
                <YAxis stroke={isDarkMode ? '#cbd5e1' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#ffffff' : '#000000' }} />
                <Bar dataKey="technical" fill="#16a34a" />
                <Bar dataKey="clarity" fill="#0284c7" />
                <Bar dataKey="confidence" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </>
  );
}
