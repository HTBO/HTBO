<script setup lang="ts">
import type { User } from '~/types/User';

const { getUserStatus } = useUserStatus();
const authStore = useAuthStore();
const toast = useToast();
const refreshUsers = inject('refreshUsers') as (() => Promise<void>);

const props = defineProps<{
    friend: User;
}>();

const userStatus = computed<UserStatus>(() => getUserStatus(props.friend, authStore.user))

const addFriend = async () => {
    const { addFriend } = useUserApi();
    try {
        const success = await addFriend(props.friend._id);
        if (success) {
            await Promise.all([
                authStore.refreshUser(),
                refreshUsers?.()
            ]);
        }
    } catch (error) {
        throw error;
    }
}
</script>

<template>
    <div class="flex flex-col p-5 bg-surface-800/70 rounded-2xl">
        <div class="flex items-center gap-2">
            <NuxtLink :to="`/dashboard/users/${friend.username}`" class="group flex items-center justify-center size-12 border-2 border-primary-600 rounded-full cursor-pointer">
                <NuxtImg :src="friend.avatarUrl" class="group-hover:opacity-75 rounded-full duration-300" />
            </NuxtLink>
            <div class="flex flex-col">
                <span class="text-lg font-semibold text-surface-50">{{ friend.username }}</span>
                <span class="text-sm text-gray-300">{{ friend.email }}</span>
            </div>
            <div class="grow">
                <div class="flex justify-end">
                    <span v-if="userStatus === 'me'" class="text-sm text-primary-600 font-semibold">You</span>
                    <span v-else-if="userStatus === 'accepted'" class="text-sm text-green-500 font-semibold">Friend</span>
                    <span v-else-if="userStatus === 'pending'" class="text-sm text-yellow-500 font-semibold">Pending</span>
                    <button v-else-if="userStatus === 'none'" @click="addFriend" class="flex items-center justify-center p-1.5 bg-green-600/50 hover:bg-green-600/80 rounded-lg duration-300">
                        <Icon name="icons:add-friend" size="1.75rem" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>