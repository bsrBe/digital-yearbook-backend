import { Types } from 'mongoose';
import { Friendship } from '../models';
import { FriendshipStatus } from '../types';

export const sendFriendRequest = async (requesterId: string, recipientId: string): Promise<void> => {
  if (requesterId === recipientId) {
    throw new Error('Cannot send friend request to yourself');
  }

  const existing = await Friendship.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existing) {
    if (existing.status === 'blocked') {
      throw new Error('Cannot send request to this user');
    }
    throw new Error('Friendship request already exists');
  }

  await Friendship.create({ requester: requesterId, recipient: recipientId, status: 'pending' });
};

export const respondToRequest = async (
  recipientId: string,
  requesterId: string,
  action: 'accept' | 'reject'
): Promise<void> => {
  const friendship = await Friendship.findOne({
    requester: requesterId,
    recipient: recipientId,
    status: 'pending',
  });

  if (!friendship) {
    throw new Error('Friend request not found');
  }

  friendship.status = action === 'accept' ? 'accepted' : 'rejected';
  await friendship.save();
};

export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  // Remove any existing friendship
  await Friendship.deleteOne({
    $or: [
      { requester: blockerId, recipient: blockedId },
      { requester: blockedId, recipient: blockerId },
    ],
  });

  // Create blocked relationship
  await Friendship.create({ requester: blockerId, recipient: blockedId, status: 'blocked' });
};

export const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
    status: 'accepted',
  });

  return !!friendship;
};

export const getFriends = async (userId: string): Promise<Types.ObjectId[]> => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });

  return friendships.map((f) =>
    f.requester.toString() === userId ? f.recipient : f.requester
  );
};

export const getPendingRequests = async (userId: string) => {
  return Friendship.find({ recipient: userId, status: 'pending' }).populate('requester', 'fullName profilePhoto');
};
