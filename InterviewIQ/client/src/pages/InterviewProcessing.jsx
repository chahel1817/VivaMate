import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STEPS = [
  "Analyzing your answers",
  "Evaluating technical accuracy",
  "Measuring clarity & confidence",
  "Generating personalized feedback",
  "Finalizing interview report",
];

export default function InterviewProcessing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });

      setProgress((prev) => {
        if (prev < 100) return prev + 20;
        return prev;
      });
    }, 1200);

    const timeout = setTimeout(() => {
      navigate("/interview-summary");
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">

          {/* TITLE */}
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Processing Your Interview
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Please wait while our AI evaluates your performance
          </p>

          {/* LOADER */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          </div>

          {/* CURRENT STEP */}
          <p className="text-slate-700 font-medium mb-4">
            {STEPS[step]}...
          </p>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* FOOTER TEXT */}
          <p className="mt-6 text-xs text-slate-400">
            This may take a few seconds
          </p>
        </div>
      </div>
    </>
  );
}
