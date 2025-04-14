import type { Friend } from '~/types/Friend'
import type { User } from '~/types/User'

export type UserStatus = 'me' | 'none' | 'pending' | 'accepted' | 'initiator' 

export const useUserUtils = () => {
  const getAuthHeaders = () => {
    const authStore = useAuthStore()
    return {
      Authorization: `Bearer ${authStore.token}`,
    }
  }

  const getUserId = () => {
    const authStore = useAuthStore()
    return authStore.user?._id
  }

  return {
    getAuthHeaders,
    getUserId,
  }
}

export const useUserStatus = (targetUser: User | null, currentUser: User | null) => {
  const getUserStatus = (): UserStatus => {
    if (!targetUser || !currentUser) return 'none'
    
    if (targetUser._id === currentUser._id) return 'me'

    const friend = currentUser.friends?.find((friend) => {
      const id = typeof friend.userId === 'string' ? friend.userId : friend.userId._id
      return id === targetUser._id
    })

    if (!friend) return 'none'

    if (friend.friendStatus === 'pending' && friend.initiator) {
      return 'initiator'
    }

    return friend?.friendStatus as UserStatus || 'none'
  }

  const isMe = (): boolean => {
    return getUserStatus() === 'me'
  }

  const isFriend = (): boolean => {
    return getUserStatus() === 'accepted'
  }

  const isPending = (): boolean => {
    return getUserStatus() === 'pending'
  }

  const isInitiator = (): boolean => {
    return getUserStatus() === 'initiator'
  }

  const isNone = (): boolean => {
    return getUserStatus() === 'none'
  }

  return {
    getUserStatus,
    isMe,
    isFriend,
    isPending,
    isInitiator,
    isNone,
  }
}