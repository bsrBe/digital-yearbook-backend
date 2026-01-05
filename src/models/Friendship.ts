import mongoose, { Schema } from 'mongoose';
import { IFriendship } from '../types';

const friendshipSchema = new Schema<IFriendship>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    previousStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked', 'none'],
    },
    originalRequester: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate friendships
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model<IFriendship>('Friendship', friendshipSchema);
