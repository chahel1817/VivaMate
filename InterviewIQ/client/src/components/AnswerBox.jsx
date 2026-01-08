export default function AnswerBox({ answer, setAnswer }) {
  return (
    <div className="mt-6">
      <label className="block text-sm text-slate-600 mb-2">
        Your Answer
      </label>
      <textarea
        rows={7}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full border border-slate-300 rounded-xl p-4
        focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
      />
    </div>
  );
}
