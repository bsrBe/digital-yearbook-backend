import { Router } from 'express';
import { Highlight } from '../models';
import { protect, adminOnly, uploadSingle } from '../middleware';
import { uploadService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Get all highlights (public)
router.get('/', async (req, res) => {
  try {
    const highlights = await Highlight.find().sort({ createdAt: -1 });
    sendSuccess(res, highlights);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Create highlight (admin only)
router.post('/', protect, adminOnly, uploadSingle, async (req: AuthRequest, res) => {
  try {
    let imageUrl = req.body.imageUrl || '';
    let videoUrl = req.body.videoUrl || '';

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video');
      const result = await uploadService.uploadToCloudinary(
        req.file.buffer,
        'highlights',
        isVideo ? 'video' : 'image'
      );
      if (isVideo) {
        videoUrl = result.url;
      } else {
        imageUrl = result.url;
      }
    }

    const highlight = await Highlight.create({
      title: req.body.title,
      description: req.body.description,
      imageUrl,
      videoUrl,
      mediaType: req.body.mediaType || 'image',
      date: req.body.date,
    });

    sendSuccess(res, highlight, 'Highlight created', 201);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Delete highlight (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Highlight.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'Highlight deleted');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
