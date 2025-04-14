<script setup lang="ts">
import { friendsTabs } from '~/constants/Tab';
import type { Tab } from '~/types/Tab';
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const authStore = useAuthStore();
const { getUserById } = useUserApi();
const friends = ref<User[]>([]);
const filteredFriends = ref<User[]>([]);
const isLoading = ref(true);
const searchValue = useState<string>('friendSearchValue', () => '');

const activeTab = ref<Tab | null>(friendsTabs[0] ?? null);

const emptyMessage = computed(() => {
    if (isLoading.value) return 'Loading friends...';
    
    const hasSearch = !!searchValue.value;
    const hasFriends = friends.value.length > 0;
    const hasFilteredFriends = filteredFriends.value.length > 0;
    
    switch (activeTab.value?.name) {
        case 'Friends':
            return hasSearch && !hasFilteredFriends ? `No friends match "${searchValue.value}"` : 
                         'You don\'t have any friends yet';
            
        case 'Friend Requests':
            return hasSearch && !hasFilteredFriends ? `No requests match "${searchValue.value}"` : 
                         'You don\'t have any friend requests';
            
        case 'Pending Requests':
            return hasSearch && !hasFilteredFriends ? `No requests match "${searchValue.value}"` : 
                         'You don\'t have any pending requests';
        default:
            return 'No friends to display';
    }
});

const displayedFriends = computed(() => {
    if (!activeTab.value) return filteredFriends.value;
    
    const userId = authStore.user?._id;

    switch (activeTab.value.name) {
        case 'Friends':
            return filteredFriends.value.filter(friend => 
                friend.friends?.some(f => f.userId === userId && f.friendStatus === 'accepted')
            );
            
        case 'Friend Requests':
            return filteredFriends.value.filter(friend => 
                friend.friends?.some(f => f.userId === userId && f.friendStatus === 'pending')
            );
            
        case 'Pending Requests':
            return filteredFriends.value.filter(friend => 
                friend.friends?.some(f => f.userId === userId && !f.initiator)
            );
        default:
            return filteredFriends.value;
    }
});

const loadFriends = async () => {
    isLoading.value = true;
    try {
        if (!authStore.user) return;
        const response = await Promise.all(
            authStore.user.friends.map(friend => getUserById(typeof friend.userId === 'string' ? friend.userId : friend.userId._id))
        );
        
        friends.value = response || [];
        filteredFriends.value = friends.value;
    } catch (error) {
        console.error('Failed to load friends', error);
    } finally {
        isLoading.value = false;
    }
};

watch(searchValue, (newValue) => {
    if (newValue) {
        filteredFriends.value = friends.value.filter(friend => 
            friend.username.toLowerCase().includes(newValue.toLowerCase())
        );
    } else {
        filteredFriends.value = friends.value;
    }
});

onMounted(loadFriends);

provide('refreshFriends', loadFriends);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Friends</h1>
            <NuxtLink 
                to="/dashboard/friends/add" 
                class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
            >
                <Icon name="icons:add-friend" size="1.25rem" />
                <span>Add Friend</span>
            </NuxtLink>
        </div>
        
        <TabNavigation :tabs="friendsTabs" @update:active-tab="activeTab = $event" />

        <SectionsFriends 
            :friends="displayedFriends"
            :is-loading="isLoading"
            :empty-message="emptyMessage"
            :show-add-friend-link="friends.length === 0 && activeTab?.name === 'Friends'"
        />
    </div>
</template>