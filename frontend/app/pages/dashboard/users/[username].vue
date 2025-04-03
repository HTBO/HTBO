<script setup lang="ts">
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const fetchUserByUsername = useUserApi().fetchUserByUsername
const { username } = route.params as { username: string }

const { data, error, status } = fetchUserByUsername(username);

const user = computed(() => {
    if (status.value === 'success' && data.value && typeof data.value === 'object' && 'user' in data.value) {
        return (data.value as { user: User }).user;
    } else if (status.value === 'error') {
        return null;
    } else {
        return null;
    }
});

const addFriend = () => {};
</script>

<template>
    <div class="flex flex-col">
        <div class="h-80 mx-5 bg-gray-700 rounded-2xl">
            <img src="/banner.jpg" width="5376" height="3072" alt="Banner" class="h-full w-full object-cover rounded-2xl" />
        </div>
        <div class="-translate-y-1/2 h-24 flex justify-center p-5 px-10 bg-gray-800/50 drop-shadow-xl inset-shadow-sm inset-shadow-gray-700/50 backdrop-blur-md rounded-xl">
            <div class="flex-1 flex">
                <div class="flex flex-col items-center">
                    <p class="text-lg font-semibold">{{ user?.friends.length }}</p>
                    <p class="font-lg font-semibold">Friends</p>
                </div>
            </div>
            <div class="flex-none flex flex-col items-center gap-2 -mt-32 z-1">
                <div class="size-32 bg-gray-800 border-4 border-primary-600 drop-shadow-2xl rounded-full">
                    <NuxtImg :src="user?.avatarUrl" class="group-hover:opacity-70 rounded-full duration-300" />
                </div>
                <p class="text-2xl font-semibold">{{ user?.username }}</p>
            </div>
            <div class="flex-1 flex justify-end items-center">
                <NuxtLink v-if="authStore.user?._id === user?._id" to="/dashboard" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                    <Icon name="icons:edit" size="1.25rem" />
                    <p>Edit Profile</p>
                </NuxtLink>
                <button @click="addFriend" v-else class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                    <Icon name="icons:add" size="1.25rem" />
                    Add Friend
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>