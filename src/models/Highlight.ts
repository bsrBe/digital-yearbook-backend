import mongoose, { Schema } from 'mongoose';
import { IHighlight } from '../types';

const highlightSchema = new Schema<IHighlight>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHighlight>('Highlight', highlightSchema);
