const STAGE_LABELS = ['Sent', 'Viewed', 'Accepted', 'Completed'];

export default function NotificationTimeline({ currentStage = 1 }) {
  return (
    <div className="flex items-center">
      {STAGE_LABELS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentStage ? 'bg-red-600 text-white' : 'bg-surface text-muted'
              }`}
            >
              {i + 1}
            </span>
            <span className="mt-1.5 text-[10px] text-muted">{label}</span>
          </div>
          {i < STAGE_LABELS.length - 1 && (
            <div className={`mx-2 h-0.5 flex-1 ${i < currentStage ? 'bg-red-600' : 'bg-line'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
