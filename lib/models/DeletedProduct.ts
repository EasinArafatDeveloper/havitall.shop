import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IDeletedProduct extends Document {
  identifier: string; // id, slug, or businessKoroId
  deletedAt: Date;
}

const DeletedProductSchema = new Schema<IDeletedProduct>(
  {
    identifier: { type: String, required: true, unique: true, index: true },
    deletedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default models.DeletedProduct || model<IDeletedProduct>('DeletedProduct', DeletedProductSchema);
