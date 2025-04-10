<script setup lang="ts">
import type { User } from '~/types/User';

const props = defineProps<{
    friends: User[];
    isLoading: boolean;
    emptyMessage?: string;
    showAddFriendLink?: boolean;
}>();
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else>
        <div v-if="friends.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CardsFriend v-for="friend in friends" :key="friend?._id" :friend="friend" />
        </div>
        <div v-else class="flex flex-col items-center justify-center p-8">
            <span class="text-gray-500 text-xl mb-4">{{ emptyMessage || 'No friends found' }}</span>
            <NuxtLink 
                v-if="showAddFriendLink"
                to="/dashboard/friends/add"
                class="text-primary-500 hover:text-primary-600 duration-300"
            >
                Find friends to add
            </NuxtLink>
        </div>
    </div>
</template>