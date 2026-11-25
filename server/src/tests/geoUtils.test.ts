import { calculateHaversineDistanceKm } from '../utils/geoUtils';

describe('Geographic Distance & Fallback Verification (Haversine & Micro-climates)', () => {
  test('calculates accurate distance between Peteru village and Guntur city CPCB station', () => {
    // Peteru coordinates: 16.0396° N, 80.8396° E
    // Guntur coordinates: 16.3067° N, 80.4365° E
    const distanceKm = calculateHaversineDistanceKm(16.0396, 80.8396, 16.3067, 80.4365);

    // Distance is roughly ~50 to 55 km
    expect(distanceKm).toBeGreaterThan(45);
    expect(distanceKm).toBeLessThan(60);
  });

  test('validates distance threshold (> 30 km triggers localized dispersion model fallback)', () => {
    const peteruToGuntur = calculateHaversineDistanceKm(16.0396, 80.8396, 16.3067, 80.4365);
    const RURAL_FALLBACK_THRESHOLD_KM = 30;

    // Because distance exceeds 30km, system must NOT falsely claim urban industrial station readings
    const shouldFallbackToAtmosphericModel = peteruToGuntur > RURAL_FALLBACK_THRESHOLD_KM;
    expect(shouldFallbackToAtmosphericModel).toBe(true);
  });

  test('returns 0 km distance for identical coordinates', () => {
    expect(calculateHaversineDistanceKm(28.6139, 77.209, 28.6139, 77.209)).toBe(0);
  });
});
