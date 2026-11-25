import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { DailyPlan } from '../../models/DailyPlan';
import { UserPreferences } from '../../models/UserPreferences';
import { CPCBService } from '../../services/cpcb/cpcbService';
import { OpenMeteoService } from '../../services/openMeteo/openMeteoService';
import { GeminiService } from '../../services/gemini/geminiService';
import mongoose from 'mongoose';

export class PlannerController {
  /**
   * GET /api/planner/today
   * Fetches today's plan if already generated, otherwise returns null so UI can offer generation
   */
  static async getTodayPlan(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const plan = await DailyPlan.findOne({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        date: todayStr,
      });

      res.status(200).json({ plan });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve today\'s plan: ' + err.message });
    }
  }

  /**
   * POST /api/planner/generate
   * Generates or refreshes today's Gemini AI daily plan
   */
  static async generatePlan(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);
      const todayStr = new Date().toISOString().split('T')[0];

      const { lat, lon, city } = req.body;
      const latitude = lat ?? 28.6139;
      const longitude = lon ?? 77.2090;
      const cityName = city || 'New Delhi';

      // 1. Fetch user lifestyle preferences
      const preferences = await UserPreferences.findOne({ userId });

      // 2. Fetch nearest CPCB physical telemetry within realistic 30 km radius
      let telemetry: any = null;
      try {
        const stations = await CPCBService.getNearestStations(latitude, longitude, cityName, 30);
        if (stations.length > 0) {
          telemetry = stations[0];
        }
      } catch (e) {}

      // 3. Fallback to localized Open-Meteo model for rural/suburban micro-environments
      if (!telemetry) {
        const forecast = await OpenMeteoService.getAirQualityForecast(latitude, longitude);
        const cur = forecast.hourlyForecast[0];
        telemetry = {
          city: cityName,
          station: `Localized Atmospheric Dispersion Grid (${cityName})`,
          source: 'Open-Meteo High-Resolution Model',
          aqi: forecast.currentModelAQI,
          category: forecast.currentCategory,
          pollutants: {
            pm25: cur?.pm25,
            pm10: cur?.pm10,
            no2: cur?.no2,
            so2: cur?.so2,
            o3: cur?.o3,
          },
        };
      } else {
        telemetry.source = 'CPCB';
      }

      // 4. Weather metrics
      const weather = await OpenMeteoService.getCurrentWeather(latitude, longitude).catch(() => ({
        temperature: 28,
        humidity: 50,
        windSpeed: 6,
        weatherCode: 1,
        conditionText: 'Calm',
      }));

      // 5. Invoke Gemini AI Service
      const aiResult = await GeminiService.generateDailyPlan({
        city: cityName,
        aqi: telemetry.aqi,
        category: telemetry.category,
        source: telemetry.source,
        stationName: telemetry.station,
        pollutants: telemetry.pollutants || {},
        weather,
        userLifestyle: {
          commuteMode: preferences?.lifestyle?.commuteMode,
          outdoorActivity: preferences?.lifestyle?.outdoorActivity,
          cookingFuel: preferences?.lifestyle?.cookingFuel,
          budget: preferences?.budget,
        },
      });

      // 6. Upsert into DailyPlan collection
      const plan = await DailyPlan.findOneAndUpdate(
        { userId, date: todayStr },
        {
          $set: {
            dailySummary: aiResult.dailySummary,
            riskLevel: aiResult.riskLevel,
            location: { city: cityName, latitude, longitude },
            sourceSnapshot: {
              source: telemetry.source,
              stationName: telemetry.station,
              aqi: telemetry.aqi,
              category: telemetry.category,
              pm25: telemetry.pollutants?.pm25,
              pm10: telemetry.pollutants?.pm10,
              weather: {
                temperature: weather.temperature,
                windSpeed: weather.windSpeed,
                humidity: weather.humidity,
              },
            },
            recommendations: aiResult.recommendations.map((rec) => ({
              ...rec,
              completed: false,
            })),
            limitations: aiResult.limitations,
            generatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      res.status(200).json({ plan });
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      res.status(500).json({ error: 'Failed to generate plan: ' + err.message });
    }
  }

  /**
   * PATCH /api/planner/tasks/:taskId
   * Toggles task completion state
   */
  static async toggleTask(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const taskId = req.params.taskId as string;
      const { completed } = req.body;
      const userId = new mongoose.Types.ObjectId(req.user.userId);
      const todayStr = new Date().toISOString().split('T')[0];

      const plan = await DailyPlan.findOneAndUpdate(
        { userId, date: todayStr, 'recommendations._id': new mongoose.Types.ObjectId(taskId) },
        { $set: { 'recommendations.$.completed': completed } },
        { new: true }
      );

      if (!plan) {
        res.status(404).json({ error: 'Task or daily plan not found' });
        return;
      }

      res.status(200).json({ plan });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update task: ' + err.message });
    }
  }
}
