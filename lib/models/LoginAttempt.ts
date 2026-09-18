import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ILoginAttempt extends Document {
  ip: string;
  failedCount: number;
  lockedUntil?: Date;
  updatedAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    ip: { type: String, required: true, unique: true, index: true },
    failedCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true }
);

export default models.LoginAttempt || model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
