import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IOffer extends Document {
  offerType: 'popup_poster' | 'flash_deal' | 'top_bar';
  productId?: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  targetUrl?: string;
  posterImage?: string;
  originalPrice?: number;
  offerPrice?: number;
  discountPercentage?: number;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  buttonText?: string;
  couponCode?: string;
  endDate?: string;
  isActive: boolean;
  showAsPopup?: boolean;
  popupDelaySeconds?: number;
  order?: number;
  // Top Announcement Bar fields
  topBarText?: string;
  topBarHighlight?: string;
  topBarSuffix?: string;
  topBarLink?: string;
  topBarTheme?: string;
  topBarIcon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    offerType: { 
      type: String, 
      enum: ['popup_poster', 'flash_deal', 'top_bar'], 
      default: 'popup_poster',
      index: true 
    },
    productId: { type: String, default: '' },
    productName: { type: String, default: 'Promotional Offer' },
    productImage: { type: String, default: '' },
    productSlug: { type: String, default: '' },
    targetUrl: { type: String, default: '/shop' },
    posterImage: { type: String, default: '' },
    originalPrice: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    title: { type: String, default: 'Exclusive Offer' },
    subtitle: { type: String, default: '' },
    badgeText: { type: String, default: '⚡ SPECIAL OFFER' },
    buttonText: { type: String, default: 'Shop Now' },
    couponCode: { type: String, default: '' },
    endDate: { type: String, default: () => new Date(Date.now() + 86400000 * 30).toISOString() },
    isActive: { type: Boolean, default: true, index: true },
    showAsPopup: { type: Boolean, default: true },
    popupDelaySeconds: { type: Number, default: 1 },
    order: { type: Number, default: 1 },
    // Top Announcement Bar fields
    topBarText: { type: String, default: 'Grand Launch: Use code' },
    topBarHighlight: { type: String, default: 'HAVITALL20 for 20% OFF' },
    topBarSuffix: { type: String, default: '| Free Shipping over ৳1,500' },
    topBarLink: { type: String, default: '/shop' },
    topBarTheme: { type: String, default: 'dark_gold' },
    topBarIcon: { type: String, default: 'sparkles' },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.Offer) {
  delete mongoose.models.Offer;
}

export default model<IOffer>('Offer', OfferSchema);
