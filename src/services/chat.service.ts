import { ChatMessage } from '../models';
import { areFriends, isBlockedByEither } from './friendship.service';

export const getConversation = async (userId1: string, userId2: string) => {
  /* 
  const blocked = await isBlockedByEither(userId1, userId2);
  if (blocked) {
    throw new Error('You cannot access this conversation');
  }
  */

  return ChatMessage.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).sort({ createdAt: 1 });
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  messageType: 'text' | 'image' = 'text',
  mediaUrl?: string
) => {
  const blocked = await isBlockedByEither(senderId, receiverId);
  if (blocked) {
    throw new Error('You cannot message this user');
  }

  return ChatMessage.create({ senderId, receiverId, content, messageType, mediaUrl });
};

export const markAsRead = async (messageId: string, userId: string) => {
  const message = await ChatMessage.findById(messageId);
  if (!message || message.receiverId.toString() !== userId) {
    throw new Error('Cannot mark this message');
  }

  message.read = true;
  await message.save();
  return message;
};
