<script setup lang="ts">
import type { Group } from '~/types/Group';

const props = defineProps<{
    group: Group;
}>();

const authStore = useAuthStore();
const toast = useToast();
const refreshGroups = inject('refreshGroups') as (() => Promise<void>);
const { isOwner, isPending, isMember, isNone } = useGroupMembershipStatus(props.group, authStore.user);

const acceptedMembersCount = computed(() => {
    return props.group.members.filter(member => member.groupStatus === 'accepted').length + 1;
});

const handleMemberStatus = async (groupId: string, status: 'accepted' | 'rejected') => {
    // try {
    //     await useGroupApi().updateGroupMemberStatus(groupId, status);
    //     toast.success(`You have ${status === 'accepted' ? 'accepted' : 'declined'} the group invitation`);
    //     await refreshGroups();
    // } catch (error) {
    //     toast.error('Failed to update group member status');
    // }
};

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
                    <span v-if="isOwner()" class="text-sm text-primary-600 font-semibold">Owner</span>
                    <span v-else-if="isMember()" class="text-sm text-green-500 font-semibold">Member</span>
                    <span v-else-if="isPending()" class="text-sm text-yellow-500 font-semibold">Pending</span>
                </div>
            </div>
        </div>
        <p class="text-sm text-gray-400 mt-3 line-clamp-2">{{ group.description }}</p>
        
        <div v-if="isPending()" class="flex justify-center gap-3 mt-4">
            <button @click="handleMemberStatus(group.id, 'accepted')" 
                    class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded-md duration-300">
                Accept
            </button>
            <button @click="handleMemberStatus(group.id, 'rejected')" 
                    class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md duration-300">
                Decline
            </button>
        </div>
        
        <div class="flex justify-end mt-4">
            <NuxtLink :to="`/dashboard/groups/${group.id}`" class="text-sm text-primary-500 hover:text-primary-400 duration-300">
                View Details
            </NuxtLink>
        </div>
    </div>
</template>

<style scoped></style>