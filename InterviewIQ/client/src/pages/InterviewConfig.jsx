import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function InterviewConfig() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  if (!state) {
    navigate("/interview/select");
    return null;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-800">
              Interview Setup
            </h1>
            <p className="text-slate-500 mt-1">
              Configure your interview before you begin. Choose the difficulty
              and number of questions based on your comfort level.
            </p>
          </div>

          {/* TOPIC INFO */}
          <div className="bg-white rounded-2xl p-6 border border-green-100">
            <p className="text-sm text-slate-500">Selected Topic</p>
            <h2 className="text-xl font-semibold text-green-700 mt-1">
              {state.tech}
            </h2>
            <p className="text-slate-600 mt-2">
              Domain: <span className="font-medium">{state.domain}</span>
            </p>
          </div>

          {/* CONFIG CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">

            {/* DIFFICULTY */}
            <div>
              <label className="block font-medium mb-2">
                Difficulty Level
              </label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <p className="text-sm text-slate-500 mt-2">
                {difficulty === "Easy" &&
                  "Basic conceptual questions suitable for beginners."}
                {difficulty === "Medium" &&
                  "Moderate questions covering concepts and practical usage."}
                {difficulty === "Hard" &&
                  "Advanced, scenario-based interview questions."}
              </p>
            </div>

            {/* QUESTION COUNT */}
            <div>
              <label className="block font-medium mb-2">
                Number of Questions
              </label>

              <input
                type="number"
                min={3}
                max={5}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <p className="text-sm text-slate-500 mt-2">
                Interviews usually contain 3–5 questions. More questions give
                more accurate feedback.
              </p>
            </div>
          </div>

          {/* INFO / TIPS */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h3 className="font-semibold text-green-700 mb-2">
              Interview Tips
            </h3>
            <ul className="text-sm text-green-700 list-disc pl-5 space-y-1">
              <li>Ensure your camera and microphone are enabled</li>
              <li>Answer clearly and explain your thought process</li>
              <li>Real-world examples improve your score</li>
            </ul>
          </div>

          {/* START BUTTON */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <button
              onClick={() =>
                navigate("/interview", {
                  state: {
                    domain: state.domain,
                    tech: state.tech,
                    difficulty,
                    totalQuestions: count,
                  },
                })
              }
              className="
                w-full bg-green-600 text-white py-3 rounded-xl
                text-lg font-semibold
                hover:bg-green-700 transition
              "
            >
              Start Interview
            </button>

            <p className="text-center text-sm text-slate-500 mt-3">
              You can’t change these settings once the interview begins
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
