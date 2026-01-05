import { Router, Response } from 'express';
import { protect } from '../middleware';
import { chatService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Get conversation with user
router.get('/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await chatService.getConversation(req.user!._id.toString(), req.params.userId);
    sendSuccess(res, messages);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Send message
router.post('/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const message = await chatService.sendMessage(
      req.user!._id.toString(),
      req.params.userId,
      req.body.content
    );
    sendSuccess(res, message, 'Message sent', 201);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Mark message as read
router.put('/:messageId/read', protect, async (req: AuthRequest, res: Response) => {
  try {
    const message = await chatService.markAsRead(req.params.messageId, req.user!._id.toString());
    sendSuccess(res, message, 'Message marked as read');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
