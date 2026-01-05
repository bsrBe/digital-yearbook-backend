import { Router, Response } from 'express';
import { Signature } from '../models';
import { protect } from '../middleware';
import { friendshipService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Sign someone's yearbook (friends only)
router.post('/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { message, style } = req.body;
    const fromUserId = req.user!._id.toString();
    const toUserId = req.params.userId;

    // Check if they are friends
    const areFriends = await friendshipService.areFriends(fromUserId, toUserId);
    if (!areFriends) {
      return sendError(res, 'You can only sign yearbooks of friends', 403);
    }

    const signature = await Signature.create({ fromUserId, toUserId, message, style });
    sendSuccess(res, signature, 'Yearbook signed', 201);
  } catch (error) {
    if ((error as Error).message.includes('duplicate')) {
      sendError(res, 'You have already signed this yearbook');
    } else {
      sendError(res, (error as Error).message);
    }
  }
});

// Get signatures for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const signatures = await Signature.find({ toUserId: req.params.userId }).populate(
      'fromUserId',
      'fullName profilePhoto'
    );
    sendSuccess(res, signatures);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
