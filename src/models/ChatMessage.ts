import mongoose, { Schema } from 'mongoose';
import { IChatMessage } from '../types';
import { encrypt, decrypt } from '../utils/crypto';

const chatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    messageType: { type: String, enum: ['text', 'image'], default: 'text' },
    mediaUrl: { type: String },
    read: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Middleware: Encrypt content before saving
chatMessageSchema.pre('save', function (next) {
  if (this.isModified('content') && this.messageType === 'text') {
    this.content = encrypt(this.content);
  }
  next();
});

// Middleware: Decrypt content after loading (find)
const decryptContent = (doc: any) => {
  if (doc.content && doc.messageType === 'text') {
    doc.content = decrypt(doc.content);
  }
};

chatMessageSchema.post('init', decryptContent);
chatMessageSchema.post('save', decryptContent);

// Index for efficient conversation queries
chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
