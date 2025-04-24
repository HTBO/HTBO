<script setup lang="ts">
import type { Session } from '~/types/Session';

const props = defineProps<{
    sessions: Session[];
    isLoading: boolean;
    emptyMessage?: string;
    showCreateSessionLink?: boolean;
}>();
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else>
        <div v-if="sessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CardsSession v-for="session in sessions" :key="session.id" :session="session" />
        </div>
        <div v-else class="flex flex-col items-center justify-center p-8">
            <span class="text-gray-500 text-xl mb-4">{{ emptyMessage || 'No sessions found' }}</span>
            <NuxtLink 
                v-if="showCreateSessionLink"
                to="/dashboard/sessions/create"
                class="text-primary-500 hover:text-primary-600 duration-300"
            >
                Create a new session
            </NuxtLink>
        </div>
    </div>
</template>