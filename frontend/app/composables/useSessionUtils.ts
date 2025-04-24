import type { Session, SessionTag, SessionUserStatus } from '~/types/Session';

export function useSessionUtils() {
  const authStore = useAuthStore();

  const getUserSessionStatus = (session: Session): SessionUserStatus => {
    const userId = authStore.user?._id;
    if (!userId) return 'none';
    
    if (session.hostId === userId) {
      return 'host';
    }
    
    const participantEntry = session.participants.find(p => 
      typeof p.user === 'string' ? p.user === userId : p.user._id === userId
    );
    
    if (!participantEntry) return 'none';
    
    return participantEntry.sessionStatus;
  };

const getSessionTimeTag = (session: Session): SessionTag => {
    if (!session.scheduledAt) {
        return { tag: 'Upcoming', color: 'bg-gray-500 text-gray-100' };
    }
    
    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    
    const minutesToStart = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (minutesToStart <= 0) {
        return { tag: 'Live', color: 'bg-green-500/10 text-green-500' };
    }
    
    if (minutesToStart > 0 && minutesToStart <= 30) {
        return { tag: 'Starting Soon', color: 'bg-yellow-500 text-yellow-100' };
    }
    
    return { tag: 'Upcoming', color: 'bg-blue-500 text-blue-100' };
};

  return {
    getUserSessionStatus,
    getSessionTimeTag,
  };
}