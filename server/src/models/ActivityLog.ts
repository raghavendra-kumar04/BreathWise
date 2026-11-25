import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: 'commute-switch' | 'indoor-protection' | 'exercise-reschedule' | 'community-report' | 'ventilation-timed';
  title: string;
  description?: string;
  metrics: {
    co2SavedKg?: number;
    particulateAvoidedUg?: number;
    exposureHoursAvoided?: number;
  };
  details?: Record<string, any>;
  loggedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['commute-switch', 'indoor-protection', 'exercise-reschedule', 'community-report', 'ventilation-timed'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    metrics: {
      co2SavedKg: { type: Number, default: 0 },
      particulateAvoidedUg: { type: Number, default: 0 },
      exposureHoursAvoided: { type: Number, default: 0 },
    },
    details: { type: Schema.Types.Mixed },
    loggedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index for user history queries
ActivityLogSchema.index({ userId: 1, loggedAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
