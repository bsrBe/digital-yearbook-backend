import { Router, Response } from 'express';
import { protect } from '../middleware';
import { friendshipService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Send friend request
router.post('/request/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await friendshipService.sendFriendRequest(req.user!._id.toString(), req.params.userId);
    sendSuccess(res, null, 'Friend request sent', 201);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Accept friend request
router.post('/accept/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await friendshipService.respondToRequest(req.user!._id.toString(), req.params.userId, 'accept');
    sendSuccess(res, null, 'Friend request accepted');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Reject friend request
router.post('/reject/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await friendshipService.respondToRequest(req.user!._id.toString(), req.params.userId, 'reject');
    sendSuccess(res, null, 'Friend request rejected');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Block user
router.post('/block/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await friendshipService.blockUser(req.user!._id.toString(), req.params.userId);
    sendSuccess(res, null, 'User blocked');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Unblock user
router.post('/unblock/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await friendshipService.unblockUser(req.user!._id.toString(), req.params.userId);
    sendSuccess(res, null, 'User unblocked');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Get friends list
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const friends = await friendshipService.getFriends(req.user!._id.toString());
    sendSuccess(res, friends);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Get pending requests
router.get('/pending', protect, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await friendshipService.getPendingRequests(req.user!._id.toString());
    sendSuccess(res, requests);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Get blocked users
router.get('/blocked', protect, async (req: AuthRequest, res: Response) => {
  try {
    const blocked = await friendshipService.getBlockedUsers(req.user!._id.toString());
    sendSuccess(res, blocked);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
