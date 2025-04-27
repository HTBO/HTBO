import { SectionsFriends, SectionsGroups, SectionsSessions } from "#components";
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
        name: 'Groups',
        component: markRaw(SectionsGroups),
        getProps: (user: User) => {
            const store = useGroupsStore();

            if (!store.groupsByUser[user._id] || !store.groupsByUser[user._id]!.groups) {
                store.fetchGroups(user);
            }

            return {
                groups: store.groupsByUser[user._id]?.groups || [],
                isLoading: store.groupsByUser[user._id]?.isLoading ?? true,
                emptyMessage: 'No groups yet',
                showAddGroupLink: false
            };
        }
    },
    {
        name: 'Sessions',
        component: markRaw(SectionsSessions),
        getProps: (user: User) => {
            const store = useSessionsStore();

            if (!store.sessionsByUser[user._id] || !store.sessionsByUser[user._id]!.sessions) {
                store.fetchSessions(user);
            }

            return {
                sessions: store.sessionsByUser[user._id]?.sessions || [],
                isLoading: store.sessionsByUser[user._id]?.isLoading ?? true,
                emptyMessage: 'No sessions yet',
                showCreateSessionLink: false
            };
        }
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
    },
    {
        name: 'Pending Requests',
        component: null,
    }
];

export const membersTabs: Tab[] = [
    { name: 'All Members', component: null },
    { name: 'Active', component: null },
    { name: 'Pending', component: null }
];

export const sessionsTabs: Tab[] = [
    {
        name: 'All Sessions',
        component: null,
    },
    {
        name: 'Hosting',
        component: null,
    },
    {
        name: 'Session Invites',
        component: null,
    }
];