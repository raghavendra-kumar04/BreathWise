/**
 * Official Indian National Air Quality Index (NAQI) Breakpoints & Formula
 * Source: Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change
 */

export interface SubIndexBreakpoints {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

export type AQICategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export const CPCB_BREAKPOINTS: Record<string, { breakpoints: SubIndexBreakpoints[] }> = {
  pm25: {
    breakpoints: [
      { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
      { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
      { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
      { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
      { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
      { cLow: 250.1, cHigh: 500, iLow: 401, iHigh: 500 },
    ],
  },
  pm10: {
    breakpoints: [
      { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
      { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
      { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
      { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
      { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
      { cLow: 430.1, cHigh: 600, iLow: 401, iHigh: 500 },
    ],
  },
  no2: {
    breakpoints: [
      { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
      { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
      { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
      { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
      { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
      { cLow: 400.1, cHigh: 600, iLow: 401, iHigh: 500 },
    ],
  },
  so2: {
    breakpoints: [
      { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
      { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
      { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
      { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
      { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
      { cLow: 1600.1, cHigh: 2000, iLow: 401, iHigh: 500 },
    ],
  },
  co: {
    // Note: CPCB standard CO is measured in mg/m3. If in µg/m3, divide by 1000.
    breakpoints: [
      { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
      { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
      { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
      { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
      { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
      { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
    ],
  },
  o3: {
    breakpoints: [
      { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
      { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
      { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
      { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
      { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
      { cLow: 748.1, cHigh: 1000, iLow: 401, iHigh: 500 },
    ],
  },
};

export function calculateSubIndex(pollutant: string, concentration: number): number | null {
  const table = CPCB_BREAKPOINTS[pollutant.toLowerCase()];
  if (!table) return null;

  for (const bp of table.breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      // Linear interpolation formula: Ip = [(IHi - ILo)/(BPHi - BPLo)] * (Cp - BPLo) + ILo
      const subIndex =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds highest breakpoint
  if (concentration > 0) {
    return 500;
  }
  return 0;
}

export function getAqiCategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function calculateNationalAQI(pollutants: {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}): { aqi: number; category: AQICategory; prominentPollutant: string; subIndices: Record<string, number> } {
  const subIndices: Record<string, number> = {};
  let maxIndex = 0;
  let prominent = 'PM2.5';

  for (const [key, val] of Object.entries(pollutants)) {
    if (val !== undefined && val !== null && !isNaN(val)) {
      const idx = calculateSubIndex(key, val);
      if (idx !== null) {
        subIndices[key] = idx;
        if (idx > maxIndex) {
          maxIndex = idx;
          prominent = key.toUpperCase();
        }
      }
    }
  }

  return {
    aqi: maxIndex,
    category: getAqiCategory(maxIndex),
    prominentPollutant: prominent,
    subIndices,
  };
}
