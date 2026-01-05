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
  let friendship = await Friendship.findOne({
    $or: [
      { requester: blockerId, recipient: blockedId },
      { requester: blockedId, recipient: blockerId },
    ],
  });

  if (friendship) {
    // Save current state
    friendship.previousStatus = friendship.status;
    friendship.originalRequester = friendship.requester;
    
    // Update to blocked state (requester is always the blocker)
    friendship.requester = new Types.ObjectId(blockerId);
    friendship.recipient = new Types.ObjectId(blockedId);
    friendship.status = 'blocked';
    await friendship.save();
  } else {
    // Create new blocked state
    await Friendship.create({
      requester: blockerId,
      recipient: blockedId,
      status: 'blocked',
      previousStatus: 'none',
    });
  }
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
  return Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'pending',
  })
    .populate('requester', 'fullName profilePhoto department')
    .populate('recipient', 'fullName profilePhoto department');
};

export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const friendship = await Friendship.findOne({
    requester: blockerId,
    recipient: blockedId,
    status: 'blocked',
  });

  if (!friendship) return;

  if (friendship.previousStatus === 'accepted' || friendship.previousStatus === 'pending') {
    // Restore previous status
    const original = friendship.originalRequester!;
    const recipient = original.toString() === friendship.requester.toString() 
      ? friendship.recipient 
      : friendship.requester;
    
    friendship.status = friendship.previousStatus as FriendshipStatus;
    friendship.requester = original;
    friendship.recipient = recipient;
    friendship.previousStatus = 'none';
    await friendship.save();
  } else {
    // Delete if no meaningful previous status
    await friendship.deleteOne();
  }
};

export const getBlockedUsers = async (userId: string): Promise<Types.ObjectId[]> => {
  const friendships = await Friendship.find({
    requester: userId,
    status: 'blocked',
  });

  return friendships.map((f) => f.recipient);
};

export const isBlockedByEither = async (userId1: string, userId2: string): Promise<boolean> => {
  const blocked = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'blocked' },
      { requester: userId2, recipient: userId1, status: 'blocked' },
    ],
  });
  return !!blocked;
};
