import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  itemCount?: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    image: { type: String },
    icon: { type: String },
    itemCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default models.Category || model<ICategory>('Category', CategorySchema);
