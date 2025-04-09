<script setup lang="ts">
import { profileTabs } from '~/constants/Tab'
import type { Tab } from '~/types/Tab'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const { getUserStatus } = useUserStatus()
const { getUserByUsername, cancelFriendRequest } = useUserApi()
const { username } = route.params as { username: string }

const { data: user, error, status, refresh } = getUserByUsername(username);

const userStatus = computed<UserStatus>(() => getUserStatus(user.value, authStore.user))

const addFriend = () => { };

const cancelFriend = async () => {
    try {
        if (!user.value) return;
        const success = await cancelFriendRequest(user.value._id);
        if (success) {
            await Promise.all([
                authStore.refreshUser(),
                refresh()
            ]);
        }
    } catch (error) {
        throw error;
    }
}

const activeTab = ref<Tab | null>(profileTabs[0] ?? null)
</script>

<template>
    <Loading v-if="status === 'pending'"/>
    <Transition name="fade">
        <div v-if="status === 'success'" class="flex flex-col gap-5">
            <div>
                <div class="h-80 mx-5 bg-gray-700 rounded-2xl">
                    <img src="/banner.jpg" width="5376" height="3072" alt="Banner" class="h-full w-full object-cover rounded-2xl" />
                </div>
                <div class="-mt-12 h-24 flex justify-center p-5 px-10 bg-gray-800/50 drop-shadow-xl inset-shadow-sm inset-shadow-gray-700/50 backdrop-blur-md rounded-xl">
                    <div class="flex-1 flex">
                        <div class="flex flex-col items-center">
                            <p class="text-lg font-semibold">{{ user?.friends.filter(friend => friend.friendStatus === 'accepted').length }}</p>
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
                            <NuxtLink v-if="userStatus === 'me'" to="/dashboard" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                <Icon name="icons:edit" size="1.25rem" />
                                <p>Edit Profile</p>
                            </NuxtLink>
                            <button v-else-if="userStatus === 'none'" @click="addFriend" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                                <Icon name="icons:add" size="1.25rem" />
                                <span>Add Friend</span>
                            </button>
                            <button v-else-if="userStatus === 'pending'" @click="cancelFriend" class="w-28 flex justify-center items-center gap-2 border border-yellow-500 text-yellow-500 hover:border-transparent hover:text-white hover:bg-red-600/70 font-semibold py-2 px-4 rounded-lg duration-300 group">
                                <span><span class="group-hover:hidden">Pending</span><span class="hidden group-hover:inline">Cancel</span></span>
                            </button>
                        </ClientOnly>
                    </div>
                </div>
            </div>
            <TabNavigation :tabs="profileTabs" @update:active-tab="activeTab = $event" />
            <component :is="activeTab?.component" :user="user" />
            <div class="h-screen"></div>
        </div>
    </Transition>
</template>

<style scoped></style>