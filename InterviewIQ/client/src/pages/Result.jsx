import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeedbackCard from "../components/FeedbackCard";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/dashboard");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Interview Feedback
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <FeedbackCard title="Technical" value={state.technicalScore} />
            <FeedbackCard title="Clarity" value={state.clarityScore} />
            <FeedbackCard title="Confidence" value={state.confidenceScore} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">AI Feedback</h3>
            <p className="text-slate-600">{state.feedback}</p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
