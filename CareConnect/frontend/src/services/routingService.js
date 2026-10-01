// Real driving-route lookup via OSRM's public demo server.
// OSRM is built entirely on OpenStreetMap road data — free, no API
// key. The public demo instance is rate-limited and meant for light
// demo use (exactly this use case), not production traffic at scale.
//
// Docs: http://project-osrm.org/docs/v5.24.0/api/#route-service

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

function haversineDistanceKm(from, to) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getDrivingRoute(from, to) {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;

  const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM route fetch failed');

    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) throw new Error('No route returned');

    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      fallback: false,
    };
  } catch {
    const directDistanceKm = haversineDistanceKm(from, to);
    return {
      coordinates: [[from.lat, from.lng], [to.lat, to.lng]],
      distanceKm: directDistanceKm,
      durationMin: null,
      fallback: true,
    };
  }
}