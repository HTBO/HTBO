import type { User } from '~/types/User';
import type { Session } from '~/types/Session';

interface SessionsState {
  [userId: string]: {
    sessions: Session[];
    isLoading: boolean;
    error: Error | null;
  };
}

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessionsByUser: {} as SessionsState
  }),
  
  actions: {
    async fetchSessions(user: User) {
      const userId = user._id;
      
      if (!this.sessionsByUser[userId]) {
        this.sessionsByUser[userId] = {
          sessions: [],
          isLoading: true,
          error: null
        };
      } else {
        this.sessionsByUser[userId]!.isLoading = true;
        this.sessionsByUser[userId]!.error = null;
      }
      
      try {
        const { loadSessions } = useSessionUtils();
        
        if (!user.sessions?.length) {
          this.sessionsByUser[userId]!.sessions = [];
          return;
        }
        
        const sessionIds = user.sessions.map(session => session.sessionId);
        const sessions = await loadSessions(sessionIds);
        
        this.sessionsByUser[userId]!.sessions = sessions;
      } catch (error) {
        console.error('Error fetching sessions:', error);
        this.sessionsByUser[userId]!.error = error as Error;
      } finally {
        this.sessionsByUser[userId]!.isLoading = false;
      }
    },
    
    clearUserSessions(userId: string) {
      if (this.sessionsByUser[userId]) {
        delete this.sessionsByUser[userId];
      }
    },
    
    clearAllSessions() {
      this.sessionsByUser = {};
    },
    
    async refreshUserSessions(userId: string) {
      const userApi = useUserApi();
      const user = await userApi.getUserById(userId);
      if (user) {
        await this.fetchSessions(user);
      }
    }
  }
});