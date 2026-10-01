import Card from '../common/Card';

export default function AnalyticsOverview({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <p className="font-display text-2xl font-bold text-ink">{s.value}</p>
          <p className="mt-1 text-xs text-muted">{s.label}</p>
          {s.delta && (
            <p className={`mt-2 text-xs font-semibold ${s.delta.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
              {s.delta} vs last period
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
