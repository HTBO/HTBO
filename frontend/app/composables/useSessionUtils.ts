import type { Session, SessionTag, SessionUserStatus } from '~/types/Session';

export function useSessionUtils() {
  const authStore = useAuthStore();
  const { getSessionById } = useSessionApi();
  const { getUserById } = useUserApi();
  const { getGameById } = useGameApi();
  const toast = useToast();
  const router = useRouter();

  const loadSession = async (
    sessionId: string,
    options: {
      loadParticipantDetails?: boolean,
      redirectOnError?: boolean
    } = {}
  ) => {
    const {
      loadParticipantDetails = true,
      redirectOnError = true
    } = options;

    try {
      const sessionData = await getSessionById(sessionId);
      if (!sessionData) {
        if (redirectOnError) router.push('/dashboard/sessions');
        return null;
      }

      let enrichedSession = { ...sessionData };

      try {
        const host = await getUserById(sessionData.hostId.toString());
        enrichedSession.host = host;
      } catch (error) {
        console.error('Error fetching host:', error);
      }

      try {
        const gameInfo = await getGameById(sessionData.gameId.toString());
        enrichedSession.game = gameInfo;
      } catch (error) {
        console.error('Error fetching game:', error);
      }

      if (loadParticipantDetails) {
        const participantsWithDetails = await Promise.all(
          sessionData.participants.map(async (participant) => {
            if (typeof participant.user === 'string') {
              try {
                const userData = await getUserById(participant.user);
                return {
                  ...participant,
                  userData
                };
              } catch (error) {
                console.error(`Error fetching user ${participant.user}:`, error);
                return participant;
              }
            }
            return participant;
          })
        );
        enrichedSession.participants = participantsWithDetails;
      }

      return enrichedSession;
    } catch (error) {
      console.error('Error loading session:', error);
      toast.add({
        title: 'Error',
        description: 'Failed to load session details',
        color: 'error'
      });
      if (redirectOnError) router.push('/dashboard/sessions');
      return null;
    }
  };

  const loadSessions = async (
    sessionIds: string[],
    options: {
      loadParticipantDetails?: boolean,
    } = {}
  ) => {
    const { loadParticipantDetails = false } = options;
    const sessions: Session[] = [];

    if(!sessionIds || sessionIds.length === 0) {
      return sessions;
    }
    
    try {
      for (const id of sessionIds) {
        try {
          const session = await loadSession(id, {
            loadParticipantDetails,
            redirectOnError: false
          });
          if (session) sessions.push(session);
        } catch (error) {
          console.error(`Error loading session ${id}:`, error);
        }
      }
      return sessions;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.add({
        title: 'Error',
        description: 'Failed to load sessions',
        color: 'error'
      });
      return [];
    }
  };

  const getUserSessionStatus = (session: Session | null): SessionUserStatus => {
    const userId = authStore.user?._id;
    if (!userId || !session) return 'none';

    if (session.hostId === userId) {
      return 'host';
    }

    const participantEntry = session.participants.find(p =>
      typeof p.user === 'string' ? p.user === userId : p.user._id === userId
    );

    if (!participantEntry) return 'none';

    return participantEntry.sessionStatus;
  };

  const getSessionTimeTag = (session: Session | null): SessionTag => {
    if (!session || !session.scheduledAt) {
      return { tag: 'Upcoming', color: 'bg-gray-500 text-gray-100' };
    }

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);

    const minutesToStart = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesToStart <= 0) {
      return { tag: 'Live', color: 'bg-green-500/10 text-green-500' };
    }

    if (minutesToStart > 0 && minutesToStart <= 30) {
      return { tag: 'Starting Soon', color: 'bg-yellow-500/20 text-yellow-500' };
    }

    return { tag: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' };
  };

  const getFormattedDate = (date: string | Date) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const timeString = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sessionDate.toDateString() === today.toDateString()) {
      return timeString;
    }

    if (sessionDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${timeString}`;
    }

    const month = sessionDate.getMonth() + 1;
    const day = sessionDate.getDate();
    return `${month}.${day} ${timeString}`;
  };

  const getAcceptedParticipantsCount = (session: Session | null) => {
    if (!session || !session.participants) return 0;
    return session.participants.filter(p => p.sessionStatus === 'accepted').length;
  }

  return {
    loadSession,
    loadSessions,
    getUserSessionStatus,
    getSessionTimeTag,
    getFormattedDate,
    getAcceptedParticipantsCount,
  };
}