import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function pinIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 34px; height: 34px; border-radius: 999px;
      background: ${color}; color: white; display: flex;
      align-items: center; justify-content: center;
      font-family: Manrope, sans-serif; font-weight: 800; font-size: 11px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 3px solid white;
    ">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const hospitalIcon = pinIcon('#161210', 'H');

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    map.fitBounds(points, { padding: [48, 48] });
  }, [points, map]);
  return null;
}

export default function LeafletMap({ hospital, donor, routeCoordinates = [] }) {
  const points = [];
  if (hospital) points.push([hospital.lat, hospital.lng]);
  if (donor) points.push([donor.lat, donor.lng]);
  const bounds = routeCoordinates.length > 1 ? routeCoordinates : points;
  const center = bounds[0] || [20.5937, 78.9629];

  return (
    <div className="h-full min-h-[420px] w-full overflow-hidden rounded-card border border-line">
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hospital && (
          <Marker position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
            <Popup>{hospital.label || 'Hospital'}</Popup>
          </Marker>
        )}

        {donor && (
          <Marker position={[donor.lat, donor.lng]} icon={pinIcon('#C41638', donor.bloodGroup || '')}>
            <Popup>{donor.label || 'Donor'}</Popup>
          </Marker>
        )}

        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} pathOptions={{ color: '#12B9C0', weight: 4, opacity: 0.85 }} />
        )}

        {bounds.length >= 2 && <FitBounds points={bounds} />}
      </MapContainer>
    </div>
  );
}