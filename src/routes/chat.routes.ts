import { Router, Response } from 'express';
import { protect, uploadSingle } from '../middleware';
import { chatService, uploadService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Upload image for chat
router.post('/upload', protect, uploadSingle, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded');
    }
    const result = await uploadService.uploadToCloudinary(req.file.buffer, 'chat_media');
    sendSuccess(res, { url: result.url }, 'Image uploaded');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

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
      req.body.content,
      req.body.messageType,
      req.body.mediaUrl
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
