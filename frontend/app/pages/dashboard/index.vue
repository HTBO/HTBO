<script setup lang="ts">
import type { Group } from '~/types/Group';
import type { Session } from '~/types/Session';
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    requiresAuth: true,
    middleware: 'auth'
})

const authStore = useAuthStore();
const friendsStore = useFriendsStore();
const groupsStore = useGroupsStore();
const sessionsStore = useSessionsStore();
const toast = useToast();
const isLoading = ref(true);

const friends = ref<User[]>([]);
const hasFriends = ref(false);

const groups = ref<Group[]>([]);
const hasGroups = ref(false);

const sessions = ref<Session[]>([]);
const hasSessions = ref(false);

const suggestionCards = [
    {
        icon: 'icons:add-friend',
        title: 'Add Friends',
        description: 'Connect with your gaming buddies to play together and create sessions.',
        linkTo: '/dashboard/friends/add',
        linkText: 'Get started'
    },
    {
        icon: 'icons:group',
        title: 'Create a Group',
        description: 'Form gaming groups to easily organize sessions with multiple friends.',
        linkTo: '/dashboard/groups/create',
        linkText: 'Create Now'
    },
    {
        icon: 'icons:session',
        title: 'Create a Session',
        description: 'Schedule your first gaming session and invite friends to join.',
        linkTo: '/dashboard/sessions/create',
        linkText: 'Schedule Now'
    }
];

const friendsLoading = ref(true);
const groupsLoading = ref(true);
const sessionsLoading = ref(true);

const refreshFriends = async () => {
    try {
        friendsLoading.value = true;
        if (!authStore.user) return;
        
        await friendsStore.fetchFriends(authStore.user);
        friends.value = friendsStore.friendsByUser[authStore.user._id]?.friends || [];
        hasFriends.value = friends.value.length > 0;
    } catch (error) {
        console.error('Error loading friends data:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load friends data',
            color: 'error'
        });
    } finally {
        friendsLoading.value = false;
    }
};

const refreshGroups = async () => {
    try {
        groupsLoading.value = true;
        if (!authStore.user) return;
        
        await groupsStore.fetchGroups(authStore.user);
        groups.value = groupsStore.groupsByUser[authStore.user._id]?.groups || [];
        hasGroups.value = groups.value.length > 0;
    } catch (error) {
        console.error('Error loading groups data:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load groups data',
            color: 'error'
        });
    } finally {
        groupsLoading.value = false;
    }
};

const refreshSessions = async () => {
    try {
        sessionsLoading.value = true;
        if (!authStore.user) return;
        
        await sessionsStore.fetchSessions(authStore.user);
        sessions.value = sessionsStore.sessionsByUser[authStore.user._id]?.sessions || [];
        hasSessions.value = sessions.value.length > 0;
    } catch (error) {
        console.error('Error loading sessions data:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load sessions data',
            color: 'error'
        });
    } finally {
        sessionsLoading.value = false;
    }
};

watch([friendsLoading, groupsLoading, sessionsLoading], ([friendsLoad, groupsLoad, sessionsLoad]) => {
    isLoading.value = friendsLoad || groupsLoad || sessionsLoad;
});

onMounted(async () => {
    if (!authStore.user) return;
    
    await Promise.all([
        refreshFriends(),
        refreshGroups(),
        refreshSessions()
    ]);
});

provide('refreshFriends', refreshFriends);
provide('refreshGroups', refreshGroups);
provide('refreshSessions', refreshSessions);
</script>

<template>
    <div class="space-y-8">
        <Loading v-if="isLoading" />
        <div v-else>
            <div v-if="hasFriends || hasGroups || hasSessions" class="space-y-8">
                <div v-if="hasSessions" class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">Upcoming Sessions</h2>
                        <NuxtLink to="/dashboard/sessions" class="text-primary-500 hover:text-primary-400 text-sm">View all</NuxtLink>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <CardsSession v-for="session in sessions.slice(0, 3)" :key="session.id" :session="session" />
                        <p v-if="sessions.length === 0" class="text-gray-400">No upcoming sessions scheduled yet.</p>
                    </div>
                </div>

                <div v-if="hasFriends" class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">Friends</h2>
                        <NuxtLink to="/dashboard/friends" class="text-primary-500 hover:text-primary-400 text-sm">View all</NuxtLink>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <CardsFriend v-for="friend in friends.slice(0, 3)" :key="friend._id" :friend="friend" />
                    </div>
                </div>

                <div v-if="hasGroups" class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">Your Groups</h2>
                        <NuxtLink to="/dashboard/groups" class="text-primary-500 hover:text-primary-400 text-sm">View all</NuxtLink>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <CardsGroup v-for="group in groups.slice(0, 3)" :key="group.id" :group="group" />
                    </div>
                </div>
            </div>

            <div v-else class="space-y-6">
                <div class="flex flex-col gap-3 p-8 bg-gradient-to-r from-primary-800 to-primary-600 rounded-xl">
                    <h2 class="text-3xl font-semibold">Welcome to Hop The Bros On! 👋</h2>
                    <p class="text-lg max-w-lg">Get ready to level up your gaming experience. Connect with friends, schedule sessions, and never miss a game again.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardsSuggestion v-for="(card, index) in suggestionCards" :key="index" :icon="card.icon" :title="card.title" :description="card.description" :link-to="card.linkTo" :link-text="card.linkText" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>