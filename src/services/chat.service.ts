import { ChatMessage } from '../models';
import { areFriends } from './friendship.service';

export const getConversation = async (userId1: string, userId2: string) => {
  const friends = await areFriends(userId1, userId2);
  if (!friends) {
    throw new Error('You can only chat with friends');
  }

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
  content: string
) => {
  const friends = await areFriends(senderId, receiverId);
  if (!friends) {
    throw new Error('You can only message friends');
  }

  return ChatMessage.create({ senderId, receiverId, content });
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
