import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  tagline?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  discountBadge?: string;
  bgColor?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    tagline: { type: String },
    image: { type: String, required: true },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/shop' },
    discountBadge: { type: String },
    bgColor: { type: String, default: 'from-slate-950 via-rose-950/80 to-slate-900' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default models.Banner || model<IBanner>('Banner', BannerSchema);
