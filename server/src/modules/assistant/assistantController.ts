import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Conversation } from '../../models/Conversation';
import { UserPreferences } from '../../models/UserPreferences';
import { CPCBService } from '../../services/cpcb/cpcbService';
import { OpenMeteoService } from '../../services/openMeteo/openMeteoService';
import { GeminiService } from '../../services/gemini/geminiService';
import mongoose from 'mongoose';

export class AssistantController {
  /**
   * POST /api/assistant/chat
   */
  static async chat(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { message, lat, lon, city } = req.body;
      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);
      const latitude = lat ?? 28.6139;
      const longitude = lon ?? 77.2090;
      const cityName = city || 'New Delhi';

      // 1. Fetch user lifestyle preferences
      const preferences = await UserPreferences.findOne({ userId });

      // 2. Fetch or create active conversation
      let conversation = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
      if (!conversation) {
        conversation = await Conversation.create({
          userId,
          title: 'Air Quality Discussion',
          messages: [],
        });
      }

      // 3. Retrieve verified live environmental telemetry to ground the model
      let telemetry: any = null;
      try {
        const stations = await CPCBService.getNearestStations(latitude, longitude, cityName, 80);
        if (stations.length > 0) telemetry = stations[0];
      } catch (e) {}

      if (!telemetry) {
        const forecast = await OpenMeteoService.getAirQualityForecast(latitude, longitude).catch(() => null);
        telemetry = {
          city: cityName,
          aqi: forecast?.currentModelAQI || 120,
          category: forecast?.currentCategory || 'Moderate',
          source: 'Open-Meteo Atmospheric Model',
          station: 'Regional Atmospheric Model Grid',
        };
      } else {
        telemetry.source = 'Official CPCB Ground Station';
      }

      // 4. Call Gemini Assistant
      const reply = await GeminiService.chatWithAssistant({
        message,
        conversationHistory: conversation.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        environmentalContext: {
          city: cityName,
          aqi: telemetry.aqi,
          category: telemetry.category,
          pm25: telemetry.pollutants?.pm25,
          pm10: telemetry.pollutants?.pm10,
          source: telemetry.source,
          stationName: telemetry.station,
        },
        userLifestyle: preferences?.lifestyle,
      });

      // 5. Append messages to conversation history
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        contextSnapshot: {
          city: cityName,
          aqi: telemetry.aqi,
          category: telemetry.category,
        },
      });

      conversation.messages.push({
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });

      await conversation.save();

      res.status(200).json({
        reply,
        conversationId: conversation._id,
        messages: conversation.messages,
      });
    } catch (err: any) {
      console.error('Assistant error:', err);
      res.status(500).json({ error: 'Assistant failed: ' + err.message });
    }
  }

  /**
   * GET /api/assistant/history
   */
  static async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);
      const conversation = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });

      res.status(200).json({
        messages: conversation ? conversation.messages : [],
        conversationId: conversation?._id,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve history: ' + err.message });
    }
  }

  /**
   * DELETE /api/assistant/history
   */
  static async clearHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);
      await Conversation.deleteMany({ userId });

      res.status(200).json({ success: true, message: 'History cleared.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to clear history: ' + err.message });
    }
  }
}
