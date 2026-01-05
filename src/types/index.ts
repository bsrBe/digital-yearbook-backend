import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'admin';
  department: string;
  graduationYear: number;
  studentId: string;
  profilePhoto: string;
  quote: string;
  bio: string;
  rememberMeFor: string;
  hobbies: string[];
  achievements: string[];
  phoneNumber?: string;
  telegram?: string;
  instagram?: string;
  twitter?: string;
  isActivated: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Friendship Types
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface IFriendship extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: FriendshipStatus;
  previousStatus?: FriendshipStatus | 'none';
  originalRequester?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface IChatMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image';
  mediaUrl?: string;
  read: boolean;
  createdAt: Date;
}

// Signature Types
export type SignatureStyle = 'elegant' | 'bold' | 'casual';

export interface ISignature extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  message: string;
  style: SignatureStyle;
  createdAt: Date;
}

// Memory Types
export interface IMemory extends Document {
  userId: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  createdAt: Date;
}

// Highlight Types
export type MediaType = 'image' | 'video';

export interface IHighlight extends Document {
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType: MediaType;
  date: string;
  createdAt: Date;
}

// Express Request Extension
export interface AuthRequest extends Request {
  user?: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
