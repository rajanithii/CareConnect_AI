export default function PriorityScore({ score = 82, label = 'Urgency score' }) {
  const color = score > 85 ? '#C41638' : score > 60 ? '#0E939A' : '#7A7168';
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EFE9E2" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 97.4} 97.4`} strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-display text-sm font-bold text-ink">{score}</span>
      </div>
      <div>
        <p className="font-display text-sm font-bold text-ink">{label}</p>
        <p className="text-xs text-muted">out of 100</p>
      </div>
    </div>
  );
}
