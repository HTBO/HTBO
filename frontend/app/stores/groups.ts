import type { User } from '~/types/User';
import type { Group } from '~/types/Group';

interface GroupsState {
    [userId: string]: {
        groups: Group[];
        isLoading: boolean;
        error: Error | null;
    };
}

export const useGroupsStore = defineStore('groups', {
    state: () => ({
        groupsByUser: {} as GroupsState
    }),
    
    actions: {
        async fetchGroups(user: User) {
            if (!user || !user._id) return;
            
            if (!this.groupsByUser[user._id]) {
                this.groupsByUser[user._id] = {
                    groups: [],
                    isLoading: true,
                    error: null
                };
            } else {
                this.groupsByUser[user._id]!.isLoading = true;
                this.groupsByUser[user._id]!.error = null;
            }
            
            try {
                const userGroups = await Promise.all(
                    user.groups?.map(async (group): Promise<Group | null> => {
                        try {
                            return await useGroupApi().getGroupById(group.groupId);
                        } catch (error) {
                            console.error('Error fetching group:', error);
                            return null;
                        }
                    }
                ) || []);
                this.groupsByUser[user._id]!.groups = userGroups.filter((group): group is Group => group !== null);
            } catch (error) {
                console.error('Error fetching groups:', error);
                this.groupsByUser[user._id]!.error = error as Error;
            } finally {
                this.groupsByUser[user._id]!.isLoading = false;
            }
        },
        
        clearUserGroups(userId: string) {
            if (this.groupsByUser[userId]) {
                delete this.groupsByUser[userId];
            }
        },
        
        clearAllGroups() {
            this.groupsByUser = {};
        },
        
        async refreshUserGroups(userId: string) {
            const userApi = useUserApi();
            const user = await userApi.getUserById(userId);
            if (user) {
                await this.fetchGroups(user);
            }
        }
    }
});