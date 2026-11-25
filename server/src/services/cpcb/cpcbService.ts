import axios from 'axios';
import { config } from '../../config/env';
import { calculateHaversineDistanceKm } from '../../utils/geoUtils';
import { calculateNationalAQI, AQICategory } from '../../utils/aqiCalculator';

export interface CPCBStationSummary {
  station: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  lastUpdate: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
    nh3?: number;
  };
  aqi: number;
  category: AQICategory;
  prominentPollutant: string;
}

export class CPCBService {
  private static RESOURCE_ID = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
  private static BASE_URL = 'https://api.data.gov.in/resource';

  /**
   * Fetches real-time observations from data.gov.in CPCB dataset
   */
  static async fetchRawCPCBData(filters: { city?: string; state?: string; limit?: number } = {}) {
    if (!config.dataGovApiKey) {
      throw new Error('DATA_GOV_API_KEY is not configured on server.');
    }

    const limit = filters.limit || 500;
    let url = `${this.BASE_URL}/${this.RESOURCE_ID}?api-key=${config.dataGovApiKey}&format=json&limit=${limit}`;

    if (filters.city) {
      url += `&filters%5Bcity%5D=${encodeURIComponent(filters.city)}`;
    } else if (filters.state) {
      url += `&filters%5Bstate%5D=${encodeURIComponent(filters.state)}`;
    }

    const response = await axios.get(url, { timeout: 12000 });
    return response.data?.records || [];
  }

  /**
   * Finds nearest physical monitoring stations to user coordinates
   */
  static async getNearestStations(
    lat: number,
    lon: number,
    cityHint?: string,
    maxDistanceKm: number = 80
  ): Promise<CPCBStationSummary[]> {
    let records: any[] = [];

    // Attempt 1: Fetch city-specific if provided
    if (cityHint) {
      try {
        records = await this.fetchRawCPCBData({ city: cityHint, limit: 300 });
      } catch (err) {
        console.warn('City filter failed, falling back to broader fetch:', err);
      }
    }

    // Attempt 2: If city filter yielded no records, fetch nationwide active batch
    if (!records || records.length === 0) {
      records = await this.fetchRawCPCBData({ limit: 1000 });
    }

    // Group records by station name because data.gov returns 1 row per pollutant
    const stationMap: Record<string, any> = {};

    for (const rec of records) {
      const stationName = rec.station || 'Unknown Station';
      const stLat = parseFloat(rec.latitude);
      const stLon = parseFloat(rec.longitude);

      if (isNaN(stLat) || isNaN(stLon)) continue;

      if (!stationMap[stationName]) {
        stationMap[stationName] = {
          station: stationName,
          city: rec.city || cityHint || 'India',
          state: rec.state || '',
          latitude: stLat,
          longitude: stLon,
          distanceKm: calculateHaversineDistanceKm(lat, lon, stLat, stLon),
          lastUpdate: rec.last_update || new Date().toISOString(),
          pollutants: {},
        };
      }

      // Map pollutant value (avg_value preferred, fallback to max_value)
      const pollutantId = (rec.pollutant_id || '').toUpperCase();
      const val = parseFloat(rec.avg_value || rec.max_value || rec.min_value);

      if (!isNaN(val)) {
        if (pollutantId === 'PM2.5') stationMap[stationName].pollutants.pm25 = val;
        else if (pollutantId === 'PM10') stationMap[stationName].pollutants.pm10 = val;
        else if (pollutantId === 'NO2') stationMap[stationName].pollutants.no2 = val;
        else if (pollutantId === 'SO2') stationMap[stationName].pollutants.so2 = val;
        else if (pollutantId === 'CO') stationMap[stationName].pollutants.co = val;
        else if (pollutantId === 'OZONE' || pollutantId === 'O3') stationMap[stationName].pollutants.o3 = val;
        else if (pollutantId === 'NH3') stationMap[stationName].pollutants.nh3 = val;
      }
    }

    // Convert map to array and calculate official Indian National AQI for each station
    const stations: CPCBStationSummary[] = [];

    for (const st of Object.values(stationMap)) {
      if (st.distanceKm <= maxDistanceKm) {
        const aqiCalc = calculateNationalAQI(st.pollutants);
        stations.push({
          ...st,
          aqi: aqiCalc.aqi,
          category: aqiCalc.category,
          prominentPollutant: aqiCalc.prominentPollutant,
        });
      }
    }

    // Sort by nearest distance
    stations.sort((a, b) => a.distanceKm - b.distanceKm);

    return stations;
  }
}
