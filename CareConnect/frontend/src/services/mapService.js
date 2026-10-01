import { distanceBetween } from '../utils/locationUtils';

export const mapService = {
  rankByDistance(origin, points) {
    return [...points]
      .map((p) => ({ ...p, distanceKm: distanceBetween(origin, p) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },
};
