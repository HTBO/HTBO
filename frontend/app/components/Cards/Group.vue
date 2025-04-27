<script setup lang="ts">
import type { Group } from '~/types/Group';

const props = defineProps<{
    group: Group;
}>();

const router = useRouter();

const authStore = useAuthStore();
const { rejectGroup, joinGroup} = useGroupApi();
const refreshGroups = inject('refreshGroups') as (() => Promise<void>);
const { isOwner, isPending, isMember } = useGroupMembershipStatus(props.group, authStore.user);

const acceptedMembersCount = computed(() => {
    return props.group.members.filter(member => member.groupStatus === 'accepted').length + 1;
});

const handleJoinGroup = async () => {
    if(!authStore.user) return;
    await joinGroup(props.group.id, authStore.user._id)
    await refreshGroups();
};

const handleRejectGroup = async (action: 'reject' | 'leave') => {
    if(!authStore.user) return;
    await rejectGroup(props.group.id, authStore.user?._id, action);
    await refreshGroups();
};

const handleRoute = () => {
    router.push(`/dashboard/groups/${props.group.id}`);
}
</script>

<template>
    <div @click="handleRoute" class="flex flex-col p-5 bg-surface-900 hover:bg-surface-900/80 border-2 border-transparent hover:border-primary-600 rounded-2xl duration-300 cursor-pointer">
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <div class="flex items-center justify-center w-20 h-28 border-2 border-primary-600 rounded-lg bg-surface-800">
                    <Icon name="icons:group" class="text-primary-600" size="2rem" />
                </div>
                <div class="grow flex flex-col justify-between overflow-hidden">
                    <div class="flex flex-col gap-1">
                        <div class="flex gap-2 justify-between items-start">
                            <h2 class="text-xl font-semibold text-surface-50">{{ group.name }}</h2>
                            <span v-if="isOwner()" class="flex-none flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap bg-primary-600/20 text-primary-400">
                                Owner
                            </span>
                            <span v-else-if="isMember()" class="flex-none flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap bg-green-600/20 text-green-400">
                                Member
                            </span>
                            <span v-else-if="isPending()" class="flex-none flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap bg-yellow-600/20 text-yellow-400">
                                Pending
                            </span>
                        </div>
                        <p class="text-sm text-gray-400">{{ group.description }}</p>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex items-center">
                            <Icon name="icons:person" size="1rem" class="text-primary-500" />
                            <span class="text-sm text-gray-400 ml-1">{{ acceptedMembersCount }} members</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!isOwner()">
                <div v-if="isPending()" class="flex gap-2">
                    <button @click.stop="handleRejectGroup('reject')" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                        Decline
                    </button>
                    <button @click.stop="handleJoinGroup" class="w-full py-2 bg-primary-600 hover:bg-primary-700 rounded-xl duration-300">
                        Join Group
                    </button>
                </div>
                <button v-else-if="isMember()" @click.stop="handleRejectGroup('leave')" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    Leave Group
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>