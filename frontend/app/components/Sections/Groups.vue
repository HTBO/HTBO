<script setup lang="ts">
import type { Group } from '~/types/Group';

const props = defineProps<{
    groups: Group[];
    isLoading: boolean;
    emptyMessage?: string;
    showCreateGroupLink?: boolean;
}>();
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else>
        <div v-if="groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CardsGroup v-for="group in groups" :key="group?.id" :group="group" />
        </div>
        <div v-else class="flex flex-col items-center justify-center p-8">
            <span class="text-gray-500 text-xl mb-4">{{ emptyMessage || 'No groups found' }}</span>
            <NuxtLink 
                v-if="showCreateGroupLink"
                to="/dashboard/groups/create"
                class="text-primary-500 hover:text-primary-600 duration-300"
            >
                Create a new group
            </NuxtLink>
        </div>
    </div>
</template>