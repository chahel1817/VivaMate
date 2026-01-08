export default function FeedbackCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h4 className="text-sm text-slate-500">
        {title}
      </h4>
      <p className="text-3xl font-semibold text-green-600 mt-2">
        {value}/10
      </p>
    </div>
  );
}
