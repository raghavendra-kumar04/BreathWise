import mongoose, { Document, Schema } from 'mongoose';

export type ReportCategory = 'smoke' | 'dust' | 'garbage-burning' | 'industrial' | 'traffic-jam' | 'other';
export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ICommunityReport extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  category: ReportCategory;
  title: string;
  description: string;
  location: {
    city: string;
    neighborhood?: string;
    latitude: number;
    longitude: number;
  };
  evidenceImageUrl?: string;
  severity: 'low' | 'moderate' | 'high' | 'hazardous';
  status: ReportStatus;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityReportSchema = new Schema<ICommunityReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      default: 'Community Citizen',
    },
    category: {
      type: String,
      enum: ['smoke', 'dust', 'garbage-burning', 'industrial', 'traffic-jam', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description of pollution incident is required'],
      trim: true,
      maxlength: 800,
    },
    location: {
      city: { type: String, required: true, index: true },
      neighborhood: { type: String, trim: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    evidenceImageUrl: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'hazardous'],
      default: 'moderate',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved', // MVP default allows instant community visibility
      index: true,
    },
    upvotes: {
      type: Number,
      default: 1,
    },
    upvotedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    moderatorNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast city and status filtering
CommunityReportSchema.index({ status: 1, 'location.city': 1, createdAt: -1 });

export const CommunityReport = mongoose.model<ICommunityReport>(
  'CommunityReport',
  CommunityReportSchema
);
