import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import { IUser } from '../types';
import { sendEmail } from '../config/brevo';

const generateToken = (id: string): string => {
  // 7 days in seconds
  const expiresInSeconds = 7 * 24 * 60 * 60;
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: expiresInSeconds });
};

export const register = async (data: Partial<IUser>): Promise<{ user: IUser; token: string }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Check if this is the first user
  const count = await User.countDocuments();
  const isFirstUser = count === 0;

  const user = await User.create({
    ...data,
    role: isFirstUser ? 'admin' : 'student',
    isActivated: isFirstUser, // Auto-activate first user
  });

  const token = generateToken(user._id.toString());

  // No email sent on registration anymore
  
  return { user, token };
};

export const login = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActivated) {
    throw new Error('Account pending approval');
  }

  const token = generateToken(user._id.toString());
  return { user, token };
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    'Password Reset Request',
    `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
  );
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
