import mongoose, { Schema } from 'mongoose';
import { ISignature } from '../types';

const signatureSchema = new Schema<ISignature>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    style: { type: String, enum: ['elegant', 'bold', 'casual'], default: 'elegant' },
  },
  { timestamps: true }
);

// Prevent duplicate signatures from same user to same yearbook
signatureSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export default mongoose.model<ISignature>('Signature', signatureSchema);
