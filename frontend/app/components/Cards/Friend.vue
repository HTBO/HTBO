<script setup lang="ts">
import type { User } from '~/types/User';

const props = defineProps<{
    friend: User;
}>();
</script>

<template>
    <div class="flex flex-col p-5 bg-surface-800 rounded-2xl">
        <div class="flex items-center gap-2">
            <NuxtLink :to="`/dashboard/users/${friend.username}`" class="group size-12 border-2 border-primary-600 rounded-full cursor-pointer">
                <NuxtImg :src="friend.avatarUrl" class="group-hover:opacity-75 rounded-full duration-300" />
            </NuxtLink>
            <div class="flex flex-col">
                <span class="text-lg font-semibold text-surface-50">{{ friend.username }}</span>
                <span class="text-sm text-surface-400">{{ friend.email }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>