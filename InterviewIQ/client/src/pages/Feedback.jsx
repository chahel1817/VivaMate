import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Feedback() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-slate-500">
          Loading interview feedback…
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <h2 className="text-2xl font-semibold text-slate-800">
            Interview Feedback
          </h2>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {responses.length === 0 && (
            <p className="text-slate-500">
              No interview responses found yet.
            </p>
          )}

          {responses.map((r, index) => (
            <div
              key={r._id || index}
              className="bg-white border rounded-xl p-6 space-y-4"
            >
              {/* Question */}
              <h3 className="font-semibold text-slate-800">
                Question {responses.length - index}
              </h3>
              <p className="text-slate-700">{r.question}</p>

              {/* Video Playback */}
              {r.videoUrl && (
                <video
                  src={`http://localhost:5000${r.videoUrl}`}
                  controls
                  className="w-full rounded-lg border"
                />
              )}

              {/* Transcript */}
              <div>
                <h4 className="font-medium text-slate-700 mb-1">
                  Your Answer
                </h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {r.transcript}
                </p>
              </div>

              {/* AI Feedback */}
              <div>
                <h4 className="font-medium text-slate-700 mb-1">
                  AI Feedback
                </h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {r.feedback}
                </p>
              </div>

              {/* Scores */}
              {r.scores && (
                <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
                  <div className="bg-slate-100 rounded-lg p-3 text-center">
                    <p className="font-semibold">Technical</p>
                    <p>{r.scores.technical ?? "-"}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3 text-center">
                    <p className="font-semibold">Clarity</p>
                    <p>{r.scores.clarity ?? "-"}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3 text-center">
                    <p className="font-semibold">Confidence</p>
                    <p>{r.scores.confidence ?? "-"}</p>
                  </div>
                </div>
              )}

              {/* Meta */}
              <p className="text-xs text-slate-400">
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
