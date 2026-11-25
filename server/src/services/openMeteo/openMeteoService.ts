import axios from 'axios';
import { calculateNationalAQI, AQICategory, getAqiCategory } from '../../utils/aqiCalculator';

export interface ForecastHour {
  time: string;
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
}

export class OpenMeteoService {
  private static AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  private static WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Fetches model-based air quality forecasts
   */
  static async getAirQualityForecast(
    latitude: number,
    longitude: number
  ): Promise<{
    currentModelAQI: number;
    currentCategory: AQICategory;
    hourlyForecast: ForecastHour[];
    fiveDayDaily: { date: string; avgAqi: number; maxAqi: number; category: AQICategory }[];
    attribution: string;
  }> {
    const url = `${this.AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide&forecast_days=5`;

    const res = await axios.get(url, { timeout: 10000 });
    const hourly = res.data?.hourly;

    if (!hourly || !hourly.time) {
      throw new Error('Open-Meteo returned invalid hourly forecast structure.');
    }

    const hourlyForecast: ForecastHour[] = [];
    const dailyBuckets: Record<string, number[]> = {};

    for (let i = 0; i < hourly.time.length; i++) {
      const pm25 = hourly.pm2_5 ? hourly.pm2_5[i] : 0;
      const pm10 = hourly.pm10 ? hourly.pm10[i] : 0;
      const no2 = hourly.nitrogen_dioxide ? hourly.nitrogen_dioxide[i] : undefined;
      const so2 = hourly.sulphur_dioxide ? hourly.sulphur_dioxide[i] : undefined;
      const o3 = hourly.ozone ? hourly.ozone[i] : undefined;

      // Crucial: Calculate Indian National AQI from raw concentrations so units remain consistent with CPCB
      const aqiRes = calculateNationalAQI({ pm25, pm10, no2, so2, o3 });

      const dateStr = hourly.time[i].split('T')[0];
      if (!dailyBuckets[dateStr]) dailyBuckets[dateStr] = [];
      dailyBuckets[dateStr].push(aqiRes.aqi);

      hourlyForecast.push({
        time: hourly.time[i],
        aqi: aqiRes.aqi,
        category: aqiRes.category,
        pm25,
        pm10,
        no2,
        so2,
        o3,
      });
    }

    const fiveDayDaily = Object.entries(dailyBuckets).map(([date, aqis]) => {
      const avg = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length);
      const max = Math.max(...aqis);
      return {
        date,
        avgAqi: avg,
        maxAqi: max,
        category: getAqiCategory(avg),
      };
    });

    const currentHour = hourlyForecast[0] || { aqi: 100, category: 'Moderate' as AQICategory };

    return {
      currentModelAQI: currentHour.aqi,
      currentCategory: currentHour.category,
      hourlyForecast: hourlyForecast.slice(0, 24), // First 24 hours
      fiveDayDaily: fiveDayDaily.slice(0, 5),
      attribution: 'Open-Meteo Air Quality Model (Attribution: CC BY 4.0)',
    };
  }

  /**
   * Fetches real-time weather and wind metrics
   */
  static async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `${this.WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

    const res = await axios.get(url, { timeout: 10000 });
    const cur = res.data?.current;

    const weatherCode = cur?.weather_code ?? 0;

    return {
      temperature: cur?.temperature_2m ?? 25,
      humidity: cur?.relative_humidity_2m ?? 50,
      windSpeed: cur?.wind_speed_10m ?? 8,
      weatherCode,
      conditionText: this.getWeatherConditionText(weatherCode),
    };
  }

  private static getWeatherConditionText(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Hazy / Foggy';
    if (code >= 51 && code <= 67) return 'Light rain / Drizzle';
    if (code >= 71 && code <= 77) return 'Cold mist';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Calm';
  }
}
