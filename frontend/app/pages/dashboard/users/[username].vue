<script setup lang="ts">
import { profileTabs } from '~/constants/Tab'
import type { Tab } from '~/types/Tab'
import type { User } from '~/types/User'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const { getUserByUsername, addFriend, updateFriendStatus, removeFriend } = useUserApi()
const { username } = route.params as { username: string }

const loading = ref(true)
const user = ref<User | null>(null)

const userStatus = computed(() => useUserStatus(user.value, authStore.user));

const isMe = () => userStatus.value.isMe();
const isFriend = () => userStatus.value.isFriend();
const isPending = () => userStatus.value.isPending();
const isInitiator = () => userStatus.value.isInitiator();
const isNone = () => userStatus.value.isNone();

const fetchUser = async () => {
    loading.value = true
    try {
        user.value = await getUserByUsername(username)
    } catch (err) {
        user.value = null
    } finally {
        loading.value = false
    }
}

const handleAddFriend = async () => {
    if (!user.value) return
    await addFriend(user.value._id)
    await fetchUser()
};

const handleFriendRequest = async (status: 'accepted' | 'rejected') => {
    if (!user.value) return
    await updateFriendStatus(user.value._id, status);
    await fetchUser()
};

const handleRemoveFriend = async () => {
    if (!user.value) return;
    await removeFriend(user.value._id);
    await fetchUser()
}

const activeTab = ref<Tab | null>(profileTabs[0] ?? null)

onMounted(fetchUser)
</script>

<template>
    <Loading v-if="loading" />
    <Transition name="fade">
        <div v-if="!loading && user" class="flex flex-col gap-5">
            <div>
                <div class="h-80 mx-5 bg-gray-700 rounded-2xl">
                    <img src="/banner.jpg" width="5376" height="3072" alt="Banner" class="h-full w-full object-cover rounded-2xl" />
                </div>
                <div class="-mt-12 h-24 flex justify-center p-5 px-10 bg-gray-800/50 drop-shadow-xl inset-shadow-sm inset-shadow-gray-700/50 backdrop-blur-md rounded-xl">
                    <div class="flex-1 flex">
                        <div class="flex flex-col items-center">
                            <p class="text-lg font-semibold">{{user?.friends.filter(friend => friend.friendStatus === 'accepted').length}}</p>
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
                        <ClientOnly>
                            <!-- <NuxtLink v-if="isMe()" to="/dashboard" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                <Icon name="icons:edit" size="1.25rem" />
                                <p>Edit Profile</p>
                            </NuxtLink> -->
                            <button v-if="isNone()" @click="handleAddFriend" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                <Icon name="icons:add" size="1.25rem" />
                                <span>Add Friend</span>
                            </button>
                            <button v-else-if="isInitiator()" @click="handleFriendRequest('rejected')" class="w-28 flex justify-center items-center gap-2 border border-yellow-500 text-yellow-500 hover:border-transparent hover:text-white hover:bg-red-600/70 font-semibold py-2 px-4 rounded-lg duration-300 group">
                                <span><span class="group-hover:hidden">Pending</span><span class="hidden group-hover:inline">Cancel</span></span>
                            </button>
                            <div v-else-if="isPending()" class="flex gap-2">
                                <button @click="handleFriendRequest('accepted')" class="flex items-center gap-1 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                    <Icon name="icons:check" size="1.25rem" />
                                    <span>Accept</span>
                                </button>
                                <button @click="handleFriendRequest('rejected')" class="flex items-center gap-1 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                    <Icon name="icons:close" size="1.25rem" />
                                    <span>Reject</span>
                                </button>
                            </div>
                            <button v-else-if="isFriend()" @click="handleRemoveFriend" class="flex items-center gap-2 border border-green-500 text-green-500 hover:border-transparent hover:text-white hover:bg-red-600 font-semibold py-2 px-4 rounded-lg duration-300 group">
                                <span><span class="group-hover:hidden">Friend</span><span class="hidden group-hover:inline">Remove</span></span>
                            </button>
                        </ClientOnly>
                    </div>
                </div>
            </div>
            <TabNavigation :tabs="profileTabs" @update:active-tab="activeTab = $event" />
            <component :is="activeTab?.component" v-bind="activeTab?.getProps?.(user)" />
        </div>
    </Transition>
</template>

<style scoped></style>