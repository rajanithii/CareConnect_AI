import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../common/Card';

export default function PredictionCard({ group, trend, change, note }) {
  const isUp = trend === 'up';
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold text-red-600">{group}</span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{note}</p>
    </Card>
  );
}
