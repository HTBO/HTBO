<script setup lang="ts">
import type { Group } from '~/types/Group';

const props = defineProps<{
    group: Group;
}>();

const authStore = useAuthStore();
const toast = useToast();
const refreshGroups = inject('refreshGroups') as (() => Promise<void>);

const isOwner = computed(() => {
    return props.group.ownerId === authStore.user?._id;
});

const membershipStatus = computed(() => {
    if (!authStore.user) return 'none';
    
    console.log('Membership:', props.group.members);

    const membership = props.group.members.find(member => 
        member.memberId === authStore.user?._id
    );
    
    return membership ? membership.groupStatus : 'none';
});

const acceptedMembersCount = computed(() => {
    return props.group.members.filter(member => member.groupStatus === 'accepted').length;
});

</script>

<template>
    <div class="flex flex-col p-5 bg-surface-800/70 rounded-2xl">
        <div class="flex items-center gap-2">
            <NuxtLink :to="`/dashboard/groups/${group.id}`" class="group flex items-center justify-center size-12 border-2 border-primary-600 rounded-full">
                <Icon name="icons:group" class="group-hover:opacity-75 text-primary-600 duration-300" size="1.75rem" />
            </NuxtLink>
            <div class="flex flex-col">
                <span class="text-lg font-semibold text-surface-50">{{ group.name }}</span>
                <span class="text-sm text-gray-300">{{ acceptedMembersCount }} members</span>
            </div>
            <div class="grow">
                <div class="flex justify-end">
                    <span v-if="isOwner" class="text-sm text-primary-600 font-semibold">Owner</span>
                    <span v-else-if="membershipStatus === 'accepted'" class="text-sm text-green-500 font-semibold">Member</span>
                    <span v-else-if="membershipStatus === 'pending'" class="text-sm text-yellow-500 font-semibold">Pending</span>
                </div>
            </div>
        </div>
        <p class="text-sm text-gray-400 mt-3 line-clamp-2">{{ group.description }}</p>
        <div class="flex justify-end mt-4">
            <NuxtLink :to="`/dashboard/groups/${group.id}`" class="text-sm text-primary-500 hover:text-primary-400 duration-300">
                View Details
            </NuxtLink>
        </div>
    </div>
</template>

<style scoped></style>