import axios from 'axios';
import { config } from '../../config/env';
import { GeneratedPlan, GeneratedPlanSchema } from '../gemini/geminiService';

export class GroqService {
  private static readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private static readonly PRIMARY_MODEL = 'llama-3.3-70b-versatile';
  private static readonly BACKUP_MODEL = 'llama-3.1-8b-instant';

  public static isAvailable(): boolean {
    const key = config.groqApiKey || process.env.GROQ_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private static getApiKey(): string {
    const key = config.groqApiKey || process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error('GROQ_API_KEY is not configured in server .env');
    }
    return key.trim();
  }

  /**
   * Generates a structured daily action plan using Groq LLaMA-3.3 with JSON mode
   */
  public static async generateDailyPlan(systemPrompt: string, userPrompt: string): Promise<GeneratedPlan> {
    const apiKey = this.getApiKey();

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.PRIMARY_MODEL,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return GeneratedPlanSchema.parse(parsed);
    } catch (err: any) {
      console.warn('Groq Primary Model failed, attempting Groq 8B backup model...', err.message);
      // Retry with 8B instant model
      const retryRes = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.BACKUP_MODEL,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = retryRes.data?.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return GeneratedPlanSchema.parse(parsed);
    }
  }

  /**
   * Multi-turn chat with Groq assistant
   */
  public static async chat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<string> {
    const apiKey = this.getApiKey();

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.PRIMARY_MODEL,
          messages,
          temperature: 0.4,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) return reply;
      throw new Error('Empty response from Groq');
    } catch (err: any) {
      console.warn('Groq 70B failed, trying Groq 8B instant...', err.message);
      const retryRes = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.BACKUP_MODEL,
          messages,
          temperature: 0.4,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      return retryRes.data?.choices?.[0]?.message?.content || 'I could not generate an answer right now.';
    }
  }
}
