export default function QuestionBox({ question }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm text-slate-500 mb-1">
        Interview Question
      </h3>
      <p className="text-slate-800 text-lg">
        {question}
      </p>
    </div>
  );
}
