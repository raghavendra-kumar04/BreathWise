import { Request, Response } from 'express';
import { CPCBService } from '../../services/cpcb/cpcbService';
import { OpenMeteoService } from '../../services/openMeteo/openMeteoService';
import { AirQualityRecord, IAirQualityRecord } from '../../models/AirQualityRecord';

export class AirQualityController {
  /**
   * GET /api/air-quality/current?lat=...&lon=...&city=...
   * Prioritizes CPCB physical ground stations within distance, falls back to Open-Meteo model
   */
  static async getCurrent(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const city = (req.query.city as string) || 'Delhi';

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: 'Valid latitude and longitude are required query parameters.' });
        return;
      }

      // 1. Fetch nearest physical ground stations from CPCB
      let nearestStations: any[] = [];
      try {
        nearestStations = await CPCBService.getNearestStations(lat, lon, city, 80);
      } catch (err: any) {
        console.warn('CPCB retrieval issue, will use Open-Meteo fallback:', err.message);
      }

      // 2. Fetch concurrent weather conditions from Open-Meteo
      const weather = await OpenMeteoService.getCurrentWeather(lat, lon).catch(() => ({
        temperature: 28,
        humidity: 55,
        windSpeed: 8,
        weatherCode: 1,
        conditionText: 'Clear',
      }));

      // Case A: Valid nearby CPCB physical ground station found
      if (nearestStations.length > 0) {
        const primaryStation = nearestStations[0];

        const payload = {
          location: {
            city: primaryStation.city,
            state: primaryStation.state,
            latitude: lat,
            longitude: lon,
          },
          source: 'CPCB' as const,
          sourceType: 'ground-station' as const,
          indexType: 'CPCB-NatAQI' as const,
          stationName: primaryStation.station,
          stationDistanceKm: primaryStation.distanceKm,
          aqi: primaryStation.aqi,
          category: primaryStation.category,
          prominentPollutant: primaryStation.prominentPollutant,
          pollutants: primaryStation.pollutants,
          weather,
          observedAt: primaryStation.lastUpdate,
          fetchedAt: new Date().toISOString(),
          isModelFallback: false,
          nearbyStationsCount: nearestStations.length,
        };

        // Cache record silently in background
        AirQualityRecord.create({
          ...payload,
          observedAt: new Date(),
          fetchedAt: new Date(),
        } as Partial<IAirQualityRecord>).catch(() => {});

        res.status(200).json(payload);
        return;
      }

      // Case B: Fallback to high-resolution Open-Meteo model
      const forecast = await OpenMeteoService.getAirQualityForecast(lat, lon);
      const firstHour = forecast.hourlyForecast[0];

      const fallbackPayload = {
        location: {
          city,
          latitude: lat,
          longitude: lon,
        },
        source: 'Open-Meteo' as const,
        sourceType: 'model-forecast' as const,
        indexType: 'Open-Meteo-EAQ' as const,
        stationName: 'Regional Atmospheric Model Grid',
        stationDistanceKm: 0,
        aqi: forecast.currentModelAQI,
        category: forecast.currentCategory,
        prominentPollutant: 'PM2.5',
        pollutants: {
          pm25: firstHour?.pm25,
          pm10: firstHour?.pm10,
          no2: firstHour?.no2,
          so2: firstHour?.so2,
          o3: firstHour?.o3,
        },
        weather,
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        isModelFallback: true,
        attribution: forecast.attribution,
      };

      res.status(200).json(fallbackPayload);
    } catch (err: any) {
      console.error('Air quality resolution failed:', err);
      res.status(500).json({ error: 'Failed to retrieve environmental metrics: ' + err.message });
    }
  }

  /**
   * GET /api/air-quality/forecast?lat=...&lon=...
   */
  static async getForecast(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: 'Valid latitude and longitude required.' });
        return;
      }

      const forecast = await OpenMeteoService.getAirQualityForecast(lat, lon);
      res.status(200).json(forecast);
    } catch (err: any) {
      res.status(500).json({ error: 'Forecast error: ' + err.message });
    }
  }

  /**
   * GET /api/air-quality/stations?lat=...&lon=...&city=...
   */
  static async getNearbyStations(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const city = req.query.city as string;

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: 'Valid latitude and longitude required.' });
        return;
      }

      const stations = await CPCBService.getNearestStations(lat, lon, city, 120);
      res.status(200).json({ stations });
    } catch (err: any) {
      res.status(500).json({ error: 'Station query error: ' + err.message });
    }
  }

  /**
   * GET /api/air-quality/weather?lat=...&lon=...
   */
  static async getWeather(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: 'Valid latitude and longitude required.' });
        return;
      }

      const weather = await OpenMeteoService.getCurrentWeather(lat, lon);
      res.status(200).json(weather);
    } catch (err: any) {
      res.status(500).json({ error: 'Weather error: ' + err.message });
    }
  }
}
