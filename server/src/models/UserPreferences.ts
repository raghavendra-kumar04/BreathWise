import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  lifestyle: {
    commuteMode: 'walking' | 'cycling' | 'two-wheeler' | 'metro-bus' | 'car' | 'wfh';
    outdoorActivity: 'none' | 'light-walk' | 'jogging' | 'cycling' | 'outdoor-sports';
    cookingFuel: 'lpg' | 'induction' | 'biomass' | 'kerosene' | 'mixed';
    dailyRoutine?: {
      wakeUpTime?: string;
      commuteStart?: string;
      commuteEnd?: string;
    };
  };
  healthSensitivity: 'normal' | 'mild-allergy' | 'asthmatic' | 'copd' | 'senior' | 'pediatric';
  budget: 'low-cost' | 'moderate' | 'premium';
  interests: string[];
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    lifestyle: {
      commuteMode: {
        type: String,
        enum: ['walking', 'cycling', 'two-wheeler', 'metro-bus', 'car', 'wfh'],
        default: 'metro-bus',
      },
      outdoorActivity: {
        type: String,
        enum: ['none', 'light-walk', 'jogging', 'cycling', 'outdoor-sports'],
        default: 'light-walk',
      },
      cookingFuel: {
        type: String,
        enum: ['lpg', 'induction', 'biomass', 'kerosene', 'mixed'],
        default: 'lpg',
      },
      dailyRoutine: {
        wakeUpTime: { type: String, default: '07:00' },
        commuteStart: { type: String, default: '09:00' },
        commuteEnd: { type: String, default: '18:00' },
      },
    },
    budget: {
      type: String,
      enum: ['low-cost', 'moderate', 'premium'],
      default: 'moderate',
    },
    interests: {
      type: [String],
      default: ['health', 'exercise', 'home-air'],
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    healthSensitivity: {
      type: String,
      enum: ['normal', 'mild-allergy', 'asthmatic', 'copd', 'senior', 'pediatric'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreferences = mongoose.model<IUserPreferences>(
  'UserPreferences',
  UserPreferencesSchema
);
