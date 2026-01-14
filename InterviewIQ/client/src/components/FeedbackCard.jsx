export function dedupeQuestions(questions = [], key = 'text') {
	// remove falsy entries and dedupe by provided key (falls back to JSON string)
	const map = new Map();
	for (const q of (questions || [])) {
		if (!q) continue;
		const id = (q && (q._id || q.id || q[key])) || JSON.stringify(q);
		if (!map.has(id)) map.set(id, q);
	}
	return Array.from(map.values());
}

export default function FeedbackCard({ title, value, max = 10, summary = false }) {
	// value may be a number or an object { score, recommendation, strengths, weaknesses }
	let scoreVal;
	let recommendation;
	let strengths;
	let weaknesses;

	if (value && typeof value === 'object') {
		scoreVal = value.score ?? value.overallScore ?? value.value;
		recommendation = value.recommendation ?? value.reco;
		strengths = value.strengths;
		weaknesses = value.weaknesses;
	} else {
		scoreVal = value;
	}

	const isEmpty = scoreVal === null || scoreVal === undefined || Number.isNaN(Number(scoreVal));
	const numeric = isEmpty ? 0 : Number(scoreVal);
	const clamped = Math.max(0, Math.min(numeric, max));
	const pct = Math.round((clamped / max) * 100);

	let colorClass = 'text-green-600';
	if (isEmpty) colorClass = 'text-slate-400';
	else if (pct < 50) colorClass = 'text-red-500';
	else if (pct < 80) colorClass = 'text-yellow-600';

	return (
		<div className="bg-white border border-slate-200 rounded-xl p-5">
			<h4 className="text-sm text-slate-500">{title}</h4>

			<div className="flex items-center justify-between mt-2">
				<p className={`text-3xl font-semibold ${colorClass}`}>
					{isEmpty ? 'Processing…' : `${clamped}/${max}`}
				</p>
				<p className="text-sm text-slate-400">{isEmpty ? '' : `${pct}%`}</p>
			</div>

			{/* progress bar */}
			<div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
				<div
					className="h-2 bg-gradient-to-r from-green-400 to-green-600"
					style={{ width: `${isEmpty ? 0 : pct}%`, transition: 'width 400ms ease' }}
					aria-valuenow={isEmpty ? 0 : pct}
					role="progressbar"
				/>
			</div>

			{summary && (recommendation || (strengths && strengths.length) || (weaknesses && weaknesses.length)) && (
				<div className="mt-4 text-sm text-slate-700">
					{recommendation && (
						<div className="mb-2">
							<strong className="block text-slate-500">Recommendation</strong>
							<p>{recommendation}</p>
						</div>
					)}
					{Array.isArray(strengths) && strengths.length > 0 && (
						<div className="mb-2">
							<strong className="block text-slate-500">Strengths</strong>
							<ul className="list-disc ml-5">
								{strengths.map((s, i) => <li key={`str-${i}`}>{s}</li>)}
							</ul>
						</div>
					)}
					{Array.isArray(weaknesses) && weaknesses.length > 0 && (
						<div>
							<strong className="block text-slate-500">Areas to Improve</strong>
							<ul className="list-disc ml-5">
								{weaknesses.map((w, i) => <li key={`wk-${i}`}>{w}</li>)}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
