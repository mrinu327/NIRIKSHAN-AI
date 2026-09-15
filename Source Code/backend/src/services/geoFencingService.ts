export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GeoFenceResult {
  verified: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  status: 'LOCATION_VERIFIED' | 'LOCATION_MISMATCH';
}

/**
 * Calculate distance between two GPS coordinates
 * using the Haversine formula.
 */
export function calculateDistanceMeters(
  point1: GeoLocation,
  point2: GeoLocation
): number {
  const earthRadiusMeters = 6371000;

  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;

  const deltaLat =
    ((point2.latitude - point1.latitude) * Math.PI) / 180;

  const deltaLon =
    ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

/**
 * Verify whether an inspector is inside
 * the project's allowed geographic area.
 */
export function verifyGeoFence(
  projectLocation: GeoLocation,
  inspectorLocation: GeoLocation,
  allowedRadiusMeters = 200
): GeoFenceResult {
  const distanceMeters = calculateDistanceMeters(
    projectLocation,
    inspectorLocation
  );

  const verified = distanceMeters <= allowedRadiusMeters;

  return {
    verified,
    distanceMeters: Math.round(distanceMeters * 100) / 100,
    allowedRadiusMeters,
    status: verified
      ? 'LOCATION_VERIFIED'
      : 'LOCATION_MISMATCH',
  };
}