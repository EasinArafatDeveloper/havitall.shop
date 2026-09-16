import mongoose, { Schema, Document, model } from 'mongoose';

export interface IPushBroadcast extends Document {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  targetUrl: string;
  sentCount: number;
  successCount: number;
  status: 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PushBroadcastSchema = new Schema<IPushBroadcast>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: '/favicon.ico' },
    image: { type: String, default: '' },
    targetUrl: { type: String, default: '/shop' },
    sentCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.PushBroadcast) {
  delete mongoose.models.PushBroadcast;
}

export default model<IPushBroadcast>('PushBroadcast', PushBroadcastSchema);
