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

    <Loading v-if="isLoading"/>
    
    <Transition name="fade">
      <div v-if="!isLoading">
        <div v-if="filteredFriends.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <CardsFriend v-for="friend in filteredFriends" :key="friend._id" :friend="friend" />
        </div>
        <div v-else class="flex flex-col items-center justify-center p-8">
          <span class="text-gray-500 text-xl mb-4">
            {{ friends.length === 0 ? 'No friends found' : 'No friends match your search' }}
          </span>
          <NuxtLink 
            v-if="friends.length === 0"
            to="/dashboard/friends/add"
            class="text-primary-500 hover:text-primary-600 duration-300"
          >
            Find friends to add
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>