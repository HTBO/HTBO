import { SectionsFriends, SectionsSessions } from "#components";
import type { Tab } from "~/types/Tab";
import type { User } from "~/types/User";

export const profileTabs: Tab[] = [
    {
        name: 'Friends',
        component: markRaw(SectionsFriends),
        getProps: (user: User) => {
            const store = useFriendsStore();
            
            if (!store.friendsByUser[user._id] || !store.friendsByUser[user._id]!.friends) {
                store.fetchFriends(user);
            }
            
            return {
                friends: store.friendsByUser[user._id]?.friends || [],
                isLoading: store.friendsByUser[user._id]?.isLoading ?? true,
                emptyMessage: 'No friends yet',
                showAddFriendLink: false
            };
        }
    },
    {
        name: 'Sessions',
        component: markRaw(SectionsSessions)
    }
];

export const groupTabs: Tab[] = [
    {
        name: 'All Groups',
        component: null,
    },
    {
        name: 'Owned Groups',
        component: null,
    },
    {
        name: 'Group Invites',
        component: null,
    }
];

export const friendsTabs: Tab[] = [
    {
        name: 'Friends',
        component: null,
    },
    {
        name: 'Friend Requests',
        component: null,
    }
];