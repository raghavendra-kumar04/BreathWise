import { calculateSubIndex, getAqiCategory, calculateNationalAQI } from '../utils/aqiCalculator';

describe('Official CPCB National AQI (NAQI) Mathematical Engine', () => {
  describe('calculateSubIndex()', () => {
    test('calculates correct PM2.5 sub-index in Good category (0 - 30 µg/m³)', () => {
      // At 15 µg/m³, sub-index should be around 25
      const sub = calculateSubIndex('pm25', 15);
      expect(sub).toBe(25);
    });

    test('calculates correct PM2.5 sub-index in Satisfactory category (31 - 60 µg/m³)', () => {
      // At 45.5 µg/m³ (midpoint of 31-60), sub-index should be ~75
      const sub = calculateSubIndex('pm25', 45.5);
      expect(sub).toBeGreaterThanOrEqual(74);
      expect(sub).toBeLessThanOrEqual(76);
    });

    test('calculates correct PM10 sub-index at exact breakpoint boundaries', () => {
      expect(calculateSubIndex('pm10', 0)).toBe(0);
      expect(calculateSubIndex('pm10', 50)).toBe(50);
      expect(calculateSubIndex('pm10', 100)).toBe(100);
      expect(calculateSubIndex('pm10', 250)).toBe(200);
    });

    test('caps extreme PM2.5 concentrations exceeding 500 µg/m³ to 500', () => {
      const extreme = calculateSubIndex('pm25', 750);
      expect(extreme).toBe(500);
    });

    test('returns null for unsupported pollutant types', () => {
      expect(calculateSubIndex('helium', 10)).toBeNull();
    });
  });

  describe('getAqiCategory()', () => {
    test('maps all 6 official Indian CPCB AQI bands correctly', () => {
      expect(getAqiCategory(25)).toBe('Good');
      expect(getAqiCategory(50)).toBe('Good');
      expect(getAqiCategory(75)).toBe('Satisfactory');
      expect(getAqiCategory(100)).toBe('Satisfactory');
      expect(getAqiCategory(150)).toBe('Moderate');
      expect(getAqiCategory(200)).toBe('Moderate');
      expect(getAqiCategory(250)).toBe('Poor');
      expect(getAqiCategory(300)).toBe('Poor');
      expect(getAqiCategory(350)).toBe('Very Poor');
      expect(getAqiCategory(400)).toBe('Very Poor');
      expect(getAqiCategory(450)).toBe('Severe');
    });
  });

  describe('calculateNationalAQI()', () => {
    test('correctly identifies prominent pollutant driving max sub-index', () => {
      const result = calculateNationalAQI({
        pm25: 45, // Satisfactory (~75)
        pm10: 180, // Moderate (~153) -> Prominent
        no2: 20, // Good (<50)
      });

      expect(result.aqi).toBeGreaterThan(100);
      expect(result.prominentPollutant).toBe('PM10');
      expect(result.category).toBe('Moderate');
    });

    test('evaluates clean rural micro-climate accurately (e.g. Peteru / Repalle baseline)', () => {
      const result = calculateNationalAQI({
        pm25: 11.3,
        pm10: 22.0,
        no2: 6.5,
        so2: 3.1,
      });

      expect(result.aqi).toBeLessThanOrEqual(50);
      expect(result.category).toBe('Good');
    });
  });
});
