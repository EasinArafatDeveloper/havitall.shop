import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IOffer extends Document {
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  title: string;
  subtitle?: string;
  badgeText: string;
  couponCode: string;
  endDate: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productSlug: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    title: { type: String, required: true, default: 'Limited Flash Deal' },
    subtitle: { type: String, default: 'Exclusive flash discount on our top-rated collections. Claim before timer expires.' },
    badgeText: { type: String, default: '⚡ LIMITED FLASH DEAL' },
    couponCode: { type: String, default: 'HAVITALL20' },
    endDate: { type: String, default: () => new Date(Date.now() + 86400000 * 2).toISOString() },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

export default models.Offer || model<IOffer>('Offer', OfferSchema);
