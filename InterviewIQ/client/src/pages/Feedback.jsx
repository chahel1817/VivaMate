import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Feedback() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await api.get("/responses");
        setResponses(res.data);
      } catch {
        alert("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-6">

          <h2 className="text-2xl font-semibold text-slate-800">
            Interview Feedback
          </h2>

          {loading && <p>Loading...</p>}

          {!loading && responses.length === 0 && (
            <p className="text-slate-500">No feedback yet.</p>
          )}

          {responses.map((r, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border"
            >
              <h3 className="font-semibold text-slate-800 mb-2">
                Question
              </h3>
              <p className="text-slate-700 mb-4">
                {r.question}
              </p>

              <h4 className="font-semibold text-slate-700 mb-1">
                Feedback
              </h4>
              <p className="text-slate-600 mb-4">
                {r.feedback}
              </p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">Technical</p>
                  <p className="text-xl font-semibold">
                    {r.scores?.technical || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Clarity</p>
                  <p className="text-xl font-semibold">
                    {r.scores?.clarity || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Confidence</p>
                  <p className="text-xl font-semibold">
                    {r.scores?.confidence || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
