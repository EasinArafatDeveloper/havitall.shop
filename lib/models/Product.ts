import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IProduct extends Document {
  businessKoroId?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  isHot?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isDeleted?: boolean;
  badge?: string;
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  videoUrl?: string;
  features?: string[];
  tags?: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    businessKoroId: { type: String, index: true, sparse: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    images: { type: [String], required: true, default: [] },
    stock: { type: Number, required: true, default: 10, min: 0 },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    numReviews: { type: Number, default: 12 },
    isHot: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    badge: { type: String },
    variants: {
      colors: { type: [String], default: [] },
      sizes: { type: [String], default: [] },
    },
    videoUrl: { type: String },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    source: { type: String, default: 'local' },
  },
  {
    timestamps: true,
  }
);

export default models.Product || model<IProduct>('Product', ProductSchema);
