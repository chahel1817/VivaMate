import { useEffect, useState } from "react";
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
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="flex justify-center items-center h-screen text-slate-500">
          Loading performance...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* HEADER */}
          <h2 className="text-2xl font-semibold text-slate-800">
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
                className="bg-white rounded-xl border p-6 text-center"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-3xl font-semibold text-slate-800 mt-2">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* LINE CHART */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Improvement Over Time
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="technical" stroke="#16a34a" />
                <Line type="monotone" dataKey="clarity" stroke="#0284c7" />
                <Line type="monotone" dataKey="confidence" stroke="#9333ea" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Score Breakdown
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" />
                <YAxis />
                <Tooltip />
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
