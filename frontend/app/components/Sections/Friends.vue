<script setup lang="ts">
import type { User } from '~/types/User';

const props = defineProps<{
    user: User;
}>();

const friends = ref<User[]>([]);
const isLoading = ref(false);

onMounted(async () => {
    isLoading.value = true;
    const friendResponses = await Promise.all(props.user.friends
        .filter(friend => friend.friendStatus === 'accepted')
        .map(async friend => {
            if (typeof friend.userId === 'string') {
                return useUserApi().getUserById(friend.userId);
            }
            return null;
        }));
    friends.value = friendResponses.filter((friend): friend is User => friend !== null);
    isLoading.value = false;
});
</script>
<template>
    <Loading v-if="isLoading" />
    <div v-else>
        <div v-if="friends.length > 0" class="grid grid-cols-4 gap-4">
            <CardsFriend v-for="friend in friends" :key="friend?._id" :friend="friend" />
        </div>
        <div v-else class="flex flex-col items-center justify-center p-8">
            <span class="text-gray-500 text-xl mb-2">No friends found</span>
        </div>
    </div>
</template>