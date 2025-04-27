<script setup lang="ts">
import type { User } from '~/types/User';

const authStore = useAuthStore();
const { addFriend, updateFriendStatus, removeFriend } = useUserApi();
const refreshFriends = inject('refreshFriends') as (() => Promise<void>);

const props = defineProps<{
    friend: User;
}>();

const userStatus = computed(() => useUserStatus(props.friend, authStore.user));

const isMe = () => userStatus.value.isMe();
const isFriend = () => userStatus.value.isFriend();
const isPending = () => userStatus.value.isPending();
const isInitiator = () => userStatus.value.isInitiator();
const isNone = () => userStatus.value.isNone();

const handleAddFriend = async () => {
    await addFriend(props.friend._id);
    await refreshFriends?.();
}

const handleFriendRequest = async (status: 'accepted' | 'rejected') => {
    await updateFriendStatus(props.friend._id, status);
    await refreshFriends?.();
};

const handleRemoveFriend = async () => {
    await removeFriend(props.friend._id);
    await refreshFriends?.();
};
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
                    <span v-if="isMe()" class="text-sm text-primary-600 font-semibold">You</span>

                    <div v-else-if="isFriend()" class="flex items-center gap-2">
                        <button @click="handleRemoveFriend" class="flex items-center justify-center p-1.5 bg-red-600/50 hover:bg-red-600/80 rounded-lg duration-300">
                            <Icon name="icons:remove-friend" size="1.5rem" />
                        </button>
                    </div>

                    <div v-else-if="isInitiator()" class="flex items-center gap-2">
                        <span class="text-sm text-yellow-500 font-semibold">Pending</span>
                        <button @click="handleRemoveFriend" class="flex items-center justify-center p-1.5 bg-red-600/50 hover:bg-red-600/80 rounded-lg duration-300">
                            <Icon name="icons:close" size="1.5rem" />
                        </button>
                    </div>

                    <div v-else-if="isPending()" class="flex items-center gap-2">
                        <button @click="handleFriendRequest('accepted')" class="flex items-center justify-center p-1.5 bg-green-600/50 hover:bg-green-600/80 rounded-lg duration-300">
                            <Icon name="icons:check" size="1.5rem" />
                        </button>
                        <button @click="handleFriendRequest('rejected')" class="flex items-center justify-center p-1.5 bg-red-600/50 hover:bg-red-600/80 rounded-lg duration-300">
                            <Icon name="icons:close" size="1.5rem" />
                        </button>
                    </div>

                    <button v-else-if="isNone()" @click="handleAddFriend" class="flex items-center justify-center p-1.5 bg-green-600/50 hover:bg-green-600/80 rounded-lg duration-300">
                        <Icon name="icons:add-friend" size="1.75rem" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>