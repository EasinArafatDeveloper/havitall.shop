import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IFeaturedProduct extends Document {
  identifier: string; // id, slug, or businessKoroId
  isFeatured: boolean;
  isHot?: boolean;
  updatedAt: Date;
}

const FeaturedProductSchema = new Schema<IFeaturedProduct>(
  {
    identifier: { type: String, required: true, unique: true, index: true },
    isFeatured: { type: Boolean, default: true },
    isHot: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default models.FeaturedProduct || model<IFeaturedProduct>('FeaturedProduct', FeaturedProductSchema);
