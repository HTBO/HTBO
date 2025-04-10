<script setup lang="ts">
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const authStore = useAuthStore();
const friends = ref<User[]>([]);
const filteredFriends = ref<User[]>([]);
const isLoading = ref(true);
const searchValue = useState<string>('searchValue', () => '');

const emptyMessage = computed(() => {
    return friends.value.length === 0 ? 'No friends found' : 'No friends match your search';
});

const loadFriends = async () => {
  isLoading.value = true;
  try {
    if (!authStore.user) return;
    const friendResponses = await Promise.all(authStore.user.friends
      .filter(friend => friend.friendStatus === 'accepted')
      .map(async friend => {
        if (typeof friend.userId === 'string') {
            return useUserApi().getUserById(friend.userId);
        } else {
            return useUserApi().getUserById(friend.userId._id);
        }
      }));
    friends.value = friendResponses.filter((friend): friend is User => friend !== null);
    filteredFriends.value = friends.value;
  } catch (error) {
    console.error('Error loading friends:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(searchValue, (newValue) => {
    if (newValue) {
        filteredFriends.value = friends.value.filter(user => user.username.toLowerCase().includes(newValue.toLowerCase()));
    } else {
        filteredFriends.value = friends.value;
    }
});

onMounted(loadFriends);

provide('refreshUsers', loadFriends);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Friends</h1>
            <NuxtLink 
                to="/dashboard/friends/add" 
                class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
            >
                <Icon name="icons:add" size="1.25rem" />
                <span>Add Friend</span>
            </NuxtLink>
        </div>

        <SectionsFriends 
            :friends="filteredFriends"
            :is-loading="isLoading"
            :empty-message="emptyMessage"
            :show-add-friend-link="friends.length === 0"
        />
    </div>
</template>