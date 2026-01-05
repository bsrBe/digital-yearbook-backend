import { Router, Response } from 'express';
import { Memory } from '../models';
import { protect, adminOnly } from '../middleware';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Get all memories
router.get('/', protect, async (req, res) => {
  try {
    const memories = await Memory.find()
      .populate('userId', 'fullName profilePhoto')
      .sort({ createdAt: -1 });
    sendSuccess(res, memories);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Create memory
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const memory = await Memory.create({
      userId: req.user!._id,
      content: req.body.content,
    });
    sendSuccess(res, memory, 'Memory shared', 201);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Toggle like on memory
router.post('/:id/like', protect, async (req: AuthRequest, res: Response) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return sendError(res, 'Memory not found', 404);
    }

    const userId = req.user!._id;
    const alreadyLiked = memory.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      memory.likes = memory.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      memory.likes.push(userId);
    }

    await memory.save();
    sendSuccess(res, memory, alreadyLiked ? 'Like removed' : 'Memory liked');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Delete memory (owner or admin)
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return sendError(res, 'Memory not found', 404);
    }

    const isOwner = memory.userId.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 'Not authorized', 403);
    }

    await memory.deleteOne();
    sendSuccess(res, null, 'Memory deleted');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
