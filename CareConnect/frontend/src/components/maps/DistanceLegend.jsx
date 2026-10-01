export default function DistanceLegend({ distanceKm, etaMinutes }) {
  return (
    <div className="absolute bottom-4 left-4 rounded-2xl bg-white px-4 py-3 shadow-lift">
      <p className="font-display text-lg font-bold text-ink">{etaMinutes} min</p>
      <p className="text-xs text-muted">{distanceKm} km away</p>
    </div>
  );
}
