import type { Friend } from '~/types/Friend'

export type UserStatus = 'me' | 'none' | 'pending' | 'accepted' | 'blocked'

export const useUserStatus = () => {
  const getUserStatus = (targetUser: any, currentUser: any): UserStatus => {
    if (!targetUser || !currentUser) return 'none'
    
    // Check if the target user is the current user
    if (targetUser._id === currentUser._id) return 'me'

    // Check friend status
    const friend = currentUser.friends?.find((friend: Friend) => {
      const id = typeof friend.userId === 'string' ? friend.userId : friend.userId._id
      return id === targetUser._id
    })

    return friend?.friendStatus as UserStatus || 'none'
  }

  const isMe = (targetUser: any, currentUser: any): boolean => {
    return getUserStatus(targetUser, currentUser) === 'me'
  }

  const isFriend = (targetUser: any, currentUser: any): boolean => {
    return getUserStatus(targetUser, currentUser) === 'accepted'
  }

  const isPending = (targetUser: any, currentUser: any): boolean => {
    return getUserStatus(targetUser, currentUser) === 'pending'
  }

  return {
    getUserStatus,
    isMe,
    isFriend,
    isPending
  }
}