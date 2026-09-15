import mongoose, { Schema, Document, models, model } from 'mongoose';
 
export interface IFeaturedProduct extends Document {
  identifier: string; // id, slug, name, or businessKoroId
  slug?: string;
  name?: string;
  businessKoroId?: string;
  isFeatured: boolean;
  isHot?: boolean;
  updatedAt: Date;
}
 
const FeaturedProductSchema = new Schema<IFeaturedProduct>(
  {
    identifier: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    name: { type: String, index: true },
    businessKoroId: { type: String },
    isFeatured: { type: Boolean, default: true },
    isHot: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
 
export default models.FeaturedProduct || model<IFeaturedProduct>('FeaturedProduct', FeaturedProductSchema);
