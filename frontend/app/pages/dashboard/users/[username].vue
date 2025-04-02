<script setup lang="ts">
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute()
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
</script>

<template>
    <div class="flex flex-col">
        <div class="h-80 mx-5 bg-gray-700 rounded-2xl">
            <NuxtImg src="banner.jpg" alt="Banner" class="h-full w-full object-cover rounded-2xl" />
        </div>
        <div class="-translate-y-1/2 flex justify-center p-5 bg-gray-800/90 rounded-xl">
            <div>

            </div>
            <div class="flex flex-col items-center gap-2 -mt-28 z-1">
                <div class="size-32 bg-gray-800 border-4 border-primary-600 rounded-full">
                    <NuxtImg :src="user?.avatarUrl" alt="User Avatar" class="group-hover:opacity-70 rounded-full duration-300" />
                </div>
                <p class="text-2xl font-semibold">{{ user?.username }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>