import { Router, Response } from 'express';
import { User } from '../models';
import { protect, adminOnly, uploadSingle } from '../middleware';
import { uploadService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// Get all users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    sendSuccess(res, users);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Get current user profile
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    sendSuccess(res, req.user);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Update own profile
router.put('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = ['fullName', 'department', 'quote', 'bio', 'rememberMeFor', 'hobbies', 'achievements', 'phoneNumber', 'telegram', 'instagram', 'twitter'];
    const updates: Record<string, any> = {};
    
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true });
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Upload profile photo
router.post('/me/photo', protect, uploadSingle, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded');
    }

    const result = await uploadService.uploadToCloudinary(req.file.buffer, 'profiles');
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { profilePhoto: result.url },
      { new: true }
    );

    sendSuccess(res, user, 'Photo uploaded');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    sendSuccess(res, user);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Delete user (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'User deleted');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Approve user (Admin only)
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActivated: true },
      { new: true }
    );
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    sendSuccess(res, user, 'User approved');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
