import { cx } from '../../utils/helpers';

// Placeholder map surface. Swap the inner content for an actual Google Maps
// <Map> component (e.g. via @vis.gl/react-google-maps) once an API key is
// wired up through VITE_GOOGLE_MAPS_API_KEY.
export default function GoogleMap({ children, className = '' }) {
  return (
    <div
      className={cx(
        'relative h-full min-h-[360px] w-full overflow-hidden rounded-card border border-line bg-surface',
        className
      )}
    >
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E6DFD6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#map-grid)" />
        <path d="M0 210 Q100 160 200 190 T400 150" stroke="#EFE9E2" strokeWidth="14" fill="none" />
        <path d="M60 0 Q90 120 60 300" stroke="#EFE9E2" strokeWidth="10" fill="none" />
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
