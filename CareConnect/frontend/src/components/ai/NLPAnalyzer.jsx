export default function NLPAnalyzer({ text, tags = [] }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="font-mono text-xs text-muted">input</p>
      <p className="mt-1 text-sm text-ink2">&ldquo;{text}&rdquo;</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-cyan-200/30 px-2.5 py-1 text-xs font-medium text-cyan-700">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
