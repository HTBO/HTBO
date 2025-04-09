<script setup lang="ts">
import type { Group } from '~/types/Group';

const props = defineProps<{
    group: Group;
}>();
</script>

<template>
    <div class="flex flex-col p-5 bg-surface-800/70 rounded-2xl">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">
                <span class="text-lg font-semibold text-surface-50">{{ group.name }}</span>
                <span class="text-sm text-gray-300">{{ group.description }}</span>
            </div>
            <div class="flex items-center gap-2">
                <UAvatarGroup 
                    :max="3" 
                    size="sm"
                    :avatars="group.members.map(member => ({
                        src: typeof member.memberId === 'object' ? member.memberId.avatarUrl : '',
                    }))"
                />
                <UBadge size="sm">
                    {{ group.members.length }} members
                </UBadge>
            </div>
        </div>
    </div>
</template>