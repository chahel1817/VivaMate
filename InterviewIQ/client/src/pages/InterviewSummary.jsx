import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function InterviewSummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      const res = await api.get("/interview/summary");
      setSummary(res.data);
    };

    loadSummary();
  }, []);

  if (!summary) {
    return (
      <>
        <Navbar />
        <div className="h-screen flex items-center justify-center">
          Loading summary...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 space-y-6">

          <h1 className="text-2xl font-semibold">
            Interview Summary
          </h1>

          <div className="grid grid-cols-3 gap-4">
            <SummaryBox title="Overall Score" value={summary.overallScore} />
            <SummaryBox title="Interview Type" value={summary.interviewType} />
            <SummaryBox title="Recommendation" value={summary.recommendation} />
          </div>

          <Section title="Strengths">
            {summary.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </Section>

          <Section title="Weaknesses">
            {summary.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </Section>

        </div>
      </div>
    </>
  );
}

function SummaryBox({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-6 text-slate-700">{children}</ul>
    </div>
  );
}
