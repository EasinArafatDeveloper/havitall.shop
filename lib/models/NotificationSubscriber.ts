import mongoose, { Schema, Document, model } from 'mongoose';

export interface INotificationSubscriber extends Document {
  endpoint?: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  permission: 'granted' | 'denied' | 'default';
  userAgent: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  ip?: string;
  city?: string;
  country?: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSubscriberSchema = new Schema<INotificationSubscriber>(
  {
    endpoint: { type: String, default: '' },
    keys: {
      p256dh: { type: String, default: '' },
      auth: { type: String, default: '' },
    },
    permission: { 
      type: String, 
      enum: ['granted', 'denied', 'default'], 
      default: 'default',
      index: true 
    },
    userAgent: { type: String, default: '' },
    browser: { type: String, default: 'Chrome' },
    os: { type: String, default: 'Windows' },
    deviceType: { 
      type: String, 
      enum: ['desktop', 'mobile', 'tablet'], 
      default: 'desktop' 
    },
    ip: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Bangladesh' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.NotificationSubscriber) {
  delete mongoose.models.NotificationSubscriber;
}

export default model<INotificationSubscriber>('NotificationSubscriber', NotificationSubscriberSchema);
