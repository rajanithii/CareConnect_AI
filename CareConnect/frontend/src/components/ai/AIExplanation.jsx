import { Sparkles } from 'lucide-react';

export default function AIExplanation({ points = [] }) {
  return (
    <div className="rounded-2xl bg-cyan-200/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-cyan-700">
        <Sparkles size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">Why this match</span>
      </div>
      <ul className="space-y-1.5 text-sm text-ink2">
        {points.map((p) => (
          <li key={p}>&bull; {p}</li>
        ))}
      </ul>
    </div>
  );
}
