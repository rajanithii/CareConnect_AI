export default function RoutePolyline({ points = [] }) {
  if (points.length < 2) return null;
  const path = points.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      <polyline points={path} fill="none" stroke="#12B9C0" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
    </svg>
  );
}
