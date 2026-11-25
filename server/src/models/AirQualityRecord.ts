import mongoose, { Document, Schema } from 'mongoose';

export interface IAirQualityRecord extends Document {
  location: {
    city: string;
    state?: string;
    latitude: number;
    longitude: number;
  };
  source: 'CPCB' | 'Open-Meteo';
  sourceType: 'ground-station' | 'model-forecast';
  indexType: 'CPCB-NatAQI' | 'Open-Meteo-EAQ';
  stationName?: string;
  stationDistanceKm?: number;
  aqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  prominentPollutant?: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
    nh3?: number;
  };
  weather?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    weatherCode?: number;
  };
  observedAt: Date;
  fetchedAt: Date;
}

const AirQualityRecordSchema = new Schema<IAirQualityRecord>(
  {
    location: {
      city: { type: String, required: true, index: true },
      state: { type: String },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    source: {
      type: String,
      enum: ['CPCB', 'Open-Meteo'],
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['ground-station', 'model-forecast'],
      required: true,
    },
    indexType: {
      type: String,
      enum: ['CPCB-NatAQI', 'Open-Meteo-EAQ'],
      required: true,
    },
    stationName: { type: String },
    stationDistanceKm: { type: Number },
    aqi: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
      required: true,
    },
    prominentPollutant: { type: String },
    pollutants: {
      pm25: { type: Number },
      pm10: { type: Number },
      no2: { type: Number },
      so2: { type: Number },
      co: { type: Number },
      o3: { type: Number },
      nh3: { type: Number },
    },
    weather: {
      temperature: { type: Number },
      humidity: { type: Number },
      windSpeed: { type: Number },
      weatherCode: { type: Number },
    },
    observedAt: { type: Date, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge cached air records older than 24 hours
AirQualityRecordSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 86400 });

export const AirQualityRecord = mongoose.model<IAirQualityRecord>(
  'AirQualityRecord',
  AirQualityRecordSchema
);
