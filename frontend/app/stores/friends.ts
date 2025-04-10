import type { User } from '~/types/User';

interface FriendsState {
    [userId: string]: {
      friends: User[];
      isLoading: boolean;
      error: Error | null;
    };
  }

export const useFriendsStore = defineStore('friends', {
    state: () => ({
      friendsByUser: {} as FriendsState
    }),
    
    actions: {
      async fetchFriends(user: User) {
        if (!user || !user._id) return;
        
        if (!this.friendsByUser[user._id]) {
          this.friendsByUser[user._id] = {
            friends: [],
            isLoading: true,
            error: null
          };
        } else {
          this.friendsByUser[user._id]!.isLoading = true;
          this.friendsByUser[user._id]!.error = null;
        }
        
        try {
          const acceptedFriends = user.friends
            ?.filter(friend => friend.friendStatus === 'accepted')
            .map(async (friend): Promise<User | null> => {
              try {
                if (typeof friend.userId === 'string') {
                  return await useUserApi().getUserById(friend.userId);
                } else {
                  return await useUserApi().getUserById(friend.userId._id);
                }
              } catch (error) {
                console.error('Error fetching friend:', error);
                return null;
              }
            }) || [];
            
          const friendResponses = await Promise.all(acceptedFriends);
          
          this.friendsByUser[user._id]!.friends = friendResponses.filter((friend): friend is User => friend !== null);
        } catch (error) {
          console.error('Error fetching friends:', error);
          this.friendsByUser[user._id]!.error = error as Error;
        } finally {
          this.friendsByUser[user._id]!.isLoading = false;
        }
      },
      
      clearUserFriends(userId: string) {
        if (this.friendsByUser[userId]) {
          delete this.friendsByUser[userId];
        }
      },
      
      clearAllFriends() {
        this.friendsByUser = {};
      },
      
      async refreshUserFriends(userId: string) {
        const userApi = useUserApi();
        const user = await userApi.getUserById(userId);
        if (user) {
          await this.fetchFriends(user);
        }
      }
    }
  });