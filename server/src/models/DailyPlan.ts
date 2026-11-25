import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation {
  _id?: mongoose.Types.ObjectId;
  category: 'exercise' | 'commute' | 'indoor' | 'ventilation' | 'diet' | 'general';
  title: string;
  reason: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  suggestedTime?: string;
  completed: boolean;
}

export interface IDailyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  dailySummary: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high' | 'severe';
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  sourceSnapshot: {
    source: string;
    stationName?: string;
    aqi: number;
    category: string;
    pm25?: number;
    pm10?: number;
    weather?: {
      temperature?: number;
      windSpeed?: number;
      humidity?: number;
    };
  };
  recommendations: IRecommendation[];
  limitations: string[];
  generatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  category: {
    type: String,
    enum: ['exercise', 'commute', 'indoor', 'ventilation', 'diet', 'general'],
    required: true,
  },
  title: { type: String, required: true },
  reason: { type: String, required: true },
  action: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  estimatedImpact: { type: String, required: true },
  suggestedTime: { type: String },
  completed: { type: Boolean, default: false },
});

const DailyPlanSchema = new Schema<IDailyPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // e.g. "2026-11-25"
      required: true,
      index: true,
    },
    dailySummary: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very-high', 'severe'],
      required: true,
    },
    location: {
      city: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    sourceSnapshot: {
      source: { type: String, required: true },
      stationName: { type: String },
      aqi: { type: Number, required: true },
      category: { type: String, required: true },
      pm25: { type: Number },
      pm10: { type: Number },
      weather: {
        temperature: { type: Number },
        windSpeed: { type: Number },
        humidity: { type: Number },
      },
    },
    recommendations: [RecommendationSchema],
    limitations: [{ type: String }],
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Ensure one primary daily plan per user per calendar day
DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlan = mongoose.model<IDailyPlan>('DailyPlan', DailyPlanSchema);
