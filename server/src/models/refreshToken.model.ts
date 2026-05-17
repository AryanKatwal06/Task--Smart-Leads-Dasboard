import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string; // hashed
  createdAt: Date;
  expiresAt?: Date;
  revoked?: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date },
    revoked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
