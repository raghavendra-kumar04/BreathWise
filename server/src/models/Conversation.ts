import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  contextSnapshot?: {
    city?: string;
    aqi?: number;
    category?: string;
  };
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  contextSnapshot: {
    city: { type: String },
    aqi: { type: Number },
    category: { type: String },
  },
});

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Air Quality Discussion',
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Automatically remove conversation history older than 30 days
ConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema
);
