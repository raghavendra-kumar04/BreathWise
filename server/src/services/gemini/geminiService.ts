import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from '../../config/env';
import { GroqService } from '../groq/groqService';

// 1. Zod Validation Schema for Gemini Output
export const GeneratedPlanSchema = z.object({
  dailySummary: z.string(),
  riskLevel: z.enum(['low', 'moderate', 'high', 'very-high', 'severe']),
  recommendations: z.array(
    z.object({
      category: z.enum(['exercise', 'commute', 'indoor', 'ventilation', 'diet', 'general']),
      title: z.string(),
      reason: z.string(),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      estimatedImpact: z.string(),
      suggestedTime: z.string().optional(),
    })
  ),
  limitations: z.array(z.string()),
  dataSources: z.array(
    z.object({
      name: z.string(),
      observedAt: z.string().optional(),
    })
  ),
});

export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;

export class GeminiService {
  private static getClient(): GoogleGenAI {
    const key = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured on server.');
    }
    return new GoogleGenAI({ apiKey: key });
  }

  /**
   * Generates a personalized daily action plan by reasoning over verified environmental metrics
   */
  static async generateDailyPlan(params: {
    city: string;
    aqi: number;
    category: string;
    source: string;
    stationName?: string;
    pollutants: { pm25?: number; pm10?: number; no2?: number; so2?: number; co?: number; o3?: number };
    weather?: { temperature?: number; humidity?: number; windSpeed?: number; conditionText?: string };
    userLifestyle?: {
      commuteMode?: string;
      outdoorActivity?: string;
      cookingFuel?: string;
      budget?: string;
    };
  }): Promise<GeneratedPlan> {
    const systemPrompt = `You are BreatheWise, an expert AI environmental health companion for India.
You transform actual, ground-level air quality and meteorological data into realistic, personalized daily decisions.

SAFETY & INTEGRITY RULES:
1. Ground Truth: ONLY base your recommendations on the provided verified environmental data. Never fabricate or hallucinate AQI values or pollutant readings.
2. Medical Boundaries: Do NOT diagnose diseases or prescribe medications. Provide lifestyle adjustments and exposure reduction techniques.
3. Indian Context: Account for local factors such as road dust, traffic congestion, LPG/biomass cooking, morning inversion smog, and practical budget levels.
4. Output Format: Return strictly valid JSON matching the required schema. No markdown wrapping outside the JSON.`;

    const userPrompt = `Generate a personalized daily action plan for a resident with these exact parameters:

CURRENT ENVIRONMENTAL GROUND TELEMETRY:
- City: ${params.city}
- CPCB Indian National AQI: ${params.aqi} (${params.category})
- Source: ${params.source} (${params.stationName || 'Regional Physical Station'})
- PM2.5: ${params.pollutants.pm25 ?? 'N/A'} µg/m³ (CPCB 24h standard: 60 µg/m³)
- PM10: ${params.pollutants.pm10 ?? 'N/A'} µg/m³ (CPCB 24h standard: 100 µg/m³)
- NO2: ${params.pollutants.no2 ?? 'N/A'} µg/m³
- Temperature: ${params.weather?.temperature ?? 28}°C
- Wind Speed: ${params.weather?.windSpeed ?? 5} km/h (${params.weather?.conditionText || 'Calm'})
- Humidity: ${params.weather?.humidity ?? 50}%

USER LIFESTYLE PROFILE:
- Commute Mode: ${params.userLifestyle?.commuteMode || 'public transit'}
- Outdoor Activity: ${params.userLifestyle?.outdoorActivity || 'light walk'}
- Cooking Fuel: ${params.userLifestyle?.cookingFuel || 'LPG'}
- Budget Preference: ${params.userLifestyle?.budget || 'moderate'}

REQUIRED JSON RESPONSE STRUCTURE:
{
  "dailySummary": "2-3 concise sentences summarizing today's air risk and main strategy.",
  "riskLevel": "low" | "moderate" | "high" | "very-high" | "severe",
  "recommendations": [
    {
      "category": "exercise" | "commute" | "indoor" | "ventilation" | "diet" | "general",
      "title": "Clear action title",
      "reason": "Specific reason citing the telemetry (e.g. elevated PM2.5 or calm wind)",
      "action": "Concrete action to take today",
      "priority": "high" | "medium" | "low",
      "estimatedImpact": "Estimated reduction in exposure (e.g. Avoids peak 250+ particulate zone)",
      "suggestedTime": "e.g. 06:30 AM or Evening after 8 PM"
    }
  ],
  "limitations": [
    "Outdoor station measurements may differ from indoor micro-environments.",
    "Air quality varies significantly along heavy arterial traffic corridors."
  ],
  "dataSources": [
    {
      "name": "${params.source}",
      "observedAt": "${new Date().toISOString()}"
    }
  ]
}

Provide 4 to 6 distinct, highly practical recommendations tailored to this user's profile and today's air quality.`;

    // Step 1: Try Gemini
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      return GeneratedPlanSchema.parse(parsed);
    } catch (geminiErr: any) {
      console.warn('Gemini generation error, checking Groq fallback...', geminiErr.message);

      // Step 2: Groq Fallback (LLaMA-3.3 70B)
      if (GroqService.isAvailable()) {
        try {
          console.log('⚡ Groq Fallback Active: Generating plan with LLaMA-3.3...');
          return await GroqService.generateDailyPlan(systemPrompt, userPrompt);
        } catch (groqErr: any) {
          console.error('Groq plan generation failed:', groqErr.message);
        }
      }

      // Step 3: Deterministic Rule-Based Fallback
      return this.getRuleBasedFallbackPlan(params);
    }
  }

  /**
   * Conversational Assistant with real environmental context injected
   */
  static async chatWithAssistant(params: {
    message: string;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    environmentalContext: {
      city: string;
      aqi: number;
      category: string;
      pm25?: number;
      pm10?: number;
      source: string;
      stationName?: string;
    };
    userLifestyle?: any;
  }): Promise<string> {
    const systemPrompt = `You are BreatheWise AI, an intelligent, empathetic, science-grounded air quality advisor for India.
You provide clear, accurate guidance to questions about pollution, health precautions, indoor air, masks, purifiers, and lifestyle choices.

CURRENT REAL-TIME CONTEXT:
- User Location: ${params.environmentalContext.city}
- Current AQI: ${params.environmentalContext.aqi} (${params.environmentalContext.category}) - ${params.environmentalContext.source}
- Station: ${params.environmentalContext.stationName || 'Regional CPCB Physical Monitor'}
- PM2.5: ${params.environmentalContext.pm25 ?? 'Elevated'} µg/m³ | PM10: ${params.environmentalContext.pm10 ?? 'Elevated'} µg/m³
- Commute Preference: ${params.userLifestyle?.commuteMode || 'Metro/Bus'}
- Cooking Fuel: ${params.userLifestyle?.cookingFuel || 'LPG'}

GUIDELINES:
1. Always reference the actual AQI (${params.environmentalContext.aqi}) and city (${params.environmentalContext.city}) when answering location-relevant queries.
2. Emphasize low-cost and practical options alongside high-tech interventions (e.g., cross-ventilation timing, wet mopping, kitchen exhaust vs HEPA purifiers).
3. Do not invent medical claims. State guidelines from organizations like AIIMS, CPCB, and WHO.
4. Keep answers concise, actionable, and structured with bullet points where appropriate.`;

    const chatContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I have the live environmental context and Indian air quality baselines loaded. How can I help you today?" }] },
      ...params.conversationHistory.slice(-8).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: params.message }] },
    ];

    // Step 1: Try Gemini
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: chatContents as any,
        config: {
          temperature: 0.3,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (geminiErr: any) {
      console.warn('Gemini chat error, checking Groq fallback...', geminiErr.message);

      // Step 2: Groq Fallback (LLaMA-3.3 70B)
      if (GroqService.isAvailable()) {
        try {
          console.log('⚡ Groq Fallback Active: Answering query with LLaMA-3.3...');
          return await GroqService.chat(systemPrompt, params.conversationHistory, params.message);
        } catch (groqErr: any) {
          console.error('Groq chat failed:', groqErr.message);
        }
      }

      // Step 3: Context-aware fallback response
      return `Currently experiencing high demand or awaiting API key setup. Based on your location (${params.environmentalContext.city}) with an AQI of ${params.environmentalContext.aqi} (${params.environmentalContext.category}), outdoor cardio is ${params.environmentalContext.aqi <= 50 ? 'favorable and clean' : 'recommended with caution'}. Please consider wearing a well-fitting N95 mask during high-traffic hours, keeping windows closed during early morning inversion, and using kitchen exhausts.`;
    }

    return 'I could not process that query. Please try again.';
  }

  /**
   * Deterministic fallback plan if Gemini API quota is exceeded or offline
   */
  private static getRuleBasedFallbackPlan(params: any): GeneratedPlan {
    const isSevere = params.aqi > 250;
    const isPoor = params.aqi > 150;

    return {
      dailySummary: `Today's air quality in ${params.city} is ${params.category} (AQI ${params.aqi}). ${
        isSevere
          ? 'Exposure should be strictly minimized for all individuals.'
          : 'Sensitive groups should limit prolonged outdoor exertion.'
      }`,
      riskLevel: isSevere ? 'severe' : isPoor ? 'high' : 'moderate',
      recommendations: [
        {
          category: 'exercise',
          title: isPoor ? 'Move morning workouts indoors' : 'Moderate outdoor physical activity',
          reason: `Measured PM2.5 levels (${params.pollutants.pm25 || 'elevated'} µg/m³) can cause respiratory strain during deep breathing.`,
          action: isPoor
            ? 'Avoid outdoor running between 6 AM and 9 AM; switch to yoga or indoor strength training.'
            : 'Plan outdoor exercise during midday hours when dispersion is higher.',
          priority: isSevere ? 'high' : 'medium',
          estimatedImpact: 'Reduces heavy particulate lung intake by up to 60%.',
          suggestedTime: '06:00 AM - 09:00 AM',
        },
        {
          category: 'commute',
          title: 'Protective transit adjustments',
          reason: 'Roadway particulate and diesel exhaust concentrate heavily in traffic bottlenecks.',
          action: params.userLifestyle?.commuteMode === 'two-wheeler'
            ? 'Wear an airtight N95 respirator and avoid unpaved dusty shoulders.'
            : 'Keep vehicle windows rolled up and cabin air on re-circulation mode.',
          priority: 'high',
          estimatedImpact: 'Reduces in-transit black carbon exposure.',
          suggestedTime: 'Commute hours',
        },
        {
          category: 'ventilation',
          title: 'Strategic window ventilation',
          reason: `Ambient wind is ${params.weather?.windSpeed || 8} km/h with high surface inversion.`,
          action: 'Keep windows sealed during early morning; briefly air rooms between 1:00 PM and 3:00 PM if sunlight aids dispersion.',
          priority: 'medium',
          estimatedImpact: 'Prevents outdoor smog settling into living spaces.',
          suggestedTime: '01:00 PM - 03:00 PM',
        },
        {
          category: 'indoor',
          title: 'Kitchen and dust management',
          reason: `Cooking emissions combine with baseline ambient pollution.`,
          action: 'Always operate the kitchen exhaust chimney during stove usage and damp-mop floors instead of dry broom sweeping.',
          priority: 'medium',
          estimatedImpact: 'Cuts indoor PM2.5 spikes by 40%.',
          suggestedTime: 'Meal preparation times',
        },
      ],
      limitations: [
        'Generated via BreatheWise verified rules engine (Offline Fallback).',
        'Outdoor readings reflect regional CPCB stations, micro-climates vary.',
      ],
      dataSources: [
        {
          name: params.source || 'CPCB India',
          observedAt: new Date().toISOString(),
        },
      ],
    };
  }
}
