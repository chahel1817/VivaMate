import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useTheme } from "../context/themeContext";

export default function Feedback() {
  const { isDarkMode } = useTheme();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let pollInterval;
    const fetchResponses = async () => {
      try {
        const res = await api.get("/responses");
        setResponses(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    pollInterval = setInterval(fetchResponses, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading interview feedback…
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100'} p-6`}>
        <div className="max-w-5xl mx-auto space-y-6">

          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Interview Feedback
          </h2>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {responses.length === 0 && (
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No interview responses found yet.
            </p>
          )}

          {responses.map((r, index) => (
            <div
              key={r._id || index}
              className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl p-6 space-y-4`}
            >
              {/* Question */}
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Question {responses.length - index}
              </h3>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{r.question}</p>

              {/* Video Playback */}
              {r.videoUrl && (
                <video
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${r.videoUrl}`}
                  controls
                  className="w-full rounded-lg border"
                />
              )}

              {/* Transcript */}
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Your Answer
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} whitespace-pre-wrap`}>
                  {r.transcript}
                </p>
              </div>

              {/* AI Feedback */}
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  AI Feedback
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} whitespace-pre-wrap`}>
                  {r.feedback}
                </p>
              </div>

              {/* Scores */}
              {r.scores && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className={`${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} rounded-lg p-3 text-center`}>
                    <p className="font-semibold">Technical</p>
                    <p>{r.scores.technical ?? "-"}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} rounded-lg p-3 text-center`}>
                    <p className="font-semibold">Clarity</p>
                    <p>{r.scores.clarity ?? "-"}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} rounded-lg p-3 text-center`}>
                    <p className="font-semibold">Confidence</p>
                    <p>{r.scores.confidence ?? "-"}</p>
                  </div>
                </div>
              )}

              {/* Meta */}
              <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Interview Type: {r.interviewType || "Mock"} •{" "}
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
