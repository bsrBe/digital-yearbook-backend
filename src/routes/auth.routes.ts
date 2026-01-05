import { Router } from 'express';
import { authService } from '../services';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    sendError(res, (error as Error).message, 401);
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'Password reset email sent');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    sendSuccess(res, null, 'Password reset successful');
  } catch (error) {
    sendError(res, (error as Error).message);
  }
});

export default router;
