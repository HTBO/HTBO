<script setup lang="ts">
import type { Group } from '~/types/Group';
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute();
const router = useRouter();
const { id } = route.params;
const authStore = useAuthStore();
const toast = useToast();
const { getGroupById, getGroupMembers, joinGroup, leaveGroup, updateGroup, deleteGroup } = useGroupApi();

const isLoading = ref(true);
const group = ref<Group | null>(null);
const members = ref<User[]>([]);

const membershipStatus = computed(() => 
  useGroupMembershipStatus(group.value, authStore.user)
);

const isOwner = () => membershipStatus.value.isOwner();
const isMember = () => membershipStatus.value.isMember();
const isPending = () => membershipStatus.value.isPending();

const loadGroup = async () => {
    isLoading.value = true;
    try {
        const groupResponse = await getGroupById(id as string);
        group.value = groupResponse || [];
        loadMembers();
    } catch (error) {
        console.error('Error loading group:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load group details',
            color: 'error'
        });
        router.push('/dashboard/groups');
    } finally {
        isLoading.value = false;
    }
};

const loadMembers = async () => {
    try {
        const memberIds = group.value?.members.map(member => 
            typeof member.memberId === 'string' ? member.memberId : member.memberId._id
        ) || [];
        const membersResponse = await getGroupMembers(memberIds);
        members.value = membersResponse || [];
    } catch (error) {
        console.error('Error loading group members:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load group members',
            color: 'error'
        });
    }
};

const handleJoinGroup = async () => {
    try {
        if (!group.value || !authStore.user) return;
        const success = await joinGroup(group.value?.id, authStore.user?._id);
        if (success) {
            await loadGroup();
            toast.add({
                title: 'Success',
                description: 'Your request to join this group has been sent',
                color: 'success'
            });
        }
    } catch (error) {
        console.error('Error joining group:', error);
    }
};

const handleLeaveGroup = async () => {
    try {
        if (confirm('Are you sure you want to leave this group?')) {
            const success = await leaveGroup(id as string);
            if (success) {
                await loadGroup();
                toast.add({
                    title: 'Success',
                    description: 'You have left the group',
                    color: 'success'
                });
            }
        }
    } catch (error) {
        console.error('Error leaving group:', error);
    }
};

const handleDeleteGroup = async () => {
    try {
        if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            const success = await deleteGroup(id as string);
            if (success) {
                toast.add({
                    title: 'Success',
                    description: 'Group deleted successfully',
                    color: 'success'
                });
                router.push('/dashboard/groups');
            }
        }
    } catch (error) {
        console.error('Error deleting group:', error);
    }
};

const handleMemberStatus = async (memberId: string, groupStatus: 'accepted' | 'rejected') => {
    try {
        const memberData = {
            memberId,
            groupStatus
        };
        
        const success = await updateGroup(id as string, { 
            members: [memberData]
        });
        
        if (success) {
            await loadGroup();
            toast.add({
                title: 'Success',
                description: `Member ${groupStatus === 'accepted' ? 'accepted' : 'removed'}`,
                color: 'success'
            });
        }
    } catch (error) {
        console.error('Error updating member status:', error);
    }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
};

const acceptedMembersCount = computed(() => {
    if (!group.value) return 0;
    return group.value.members.filter(member => member.groupStatus === 'accepted').length;
});

onMounted(loadGroup);
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else-if="group" class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
                <NuxtLink
                    to="/dashboard/groups"
                    class="flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                    <Icon name="material-symbols:arrow-back" size="1.5rem" />
                </NuxtLink>
                <h1 class="text-2xl font-bold">Group Details</h1>
            </div>
            
            <div class="flex gap-3">
                <button 
                    v-if="isOwner()"
                    @click="handleDeleteGroup"
                    class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:delete" size="1.25rem" />
                    <span>Delete Group</span>
                </button>
                
                <button 
                    v-if="isOwner()"
                    class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:edit" size="1.25rem" />
                    <span>Edit Group</span>
                </button>
                
                <button 
                    v-if="isPending()"
                    @click="handleJoinGroup"
                    class="flex items-center gap-2 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:add" size="1.25rem" />
                    <span>Join Group</span>
                </button>
                
                <button 
                    v-if="isMember()"
                    @click="handleLeaveGroup"
                    class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:logout" size="1.25rem" />
                    <span>Leave Group</span>
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
                <div class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Group Information</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-gray-400 text-sm">Name</h3>
                            <p class="text-lg">{{ group.name }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Created</h3>
                            <p class="text-lg">{{ formatDate(group.createdAt) }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Members</h3>
                            <p class="text-lg">{{ acceptedMembersCount }} active members</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Description</h3>
                            <p class="text-lg">{{ group.description }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Status</h3>
                            <div class="flex items-center mt-1">
                                <span v-if="isOwner()" class="text-primary-500 font-medium">Owner</span>
                                <span v-else-if="isMember()" class="text-green-500 font-medium">
                                    Member
                                </span>
                                <span v-else-if="isPending()" class="text-yellow-500 font-medium">
                                    Request Pending
                                </span>
                                <span v-else class="text-gray-400 font-medium">Not a Member</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                <div class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Members</h2>
                    <div class="space-y-2">
                        <div v-if="group.members.length <= 1" class="text-gray-400">
                            No members yet
                        </div>
                        
                        <div v-for="member in group.members" :key="typeof member.memberId === 'string' ? member.memberId : member.memberId._id" class="flex justify-between items-center p-2 bg-surface-700/50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center">
                                    <Icon name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                                </div>
                                <span>{{ typeof member.memberId === 'string' ? member.memberId : member.memberId.username }}</span>
                            </div>
                            <span 
                                :class="{
                                    'text-green-500': member.groupStatus === 'accepted',
                                    'text-yellow-500': member.groupStatus === 'pending',
                                    'text-red-500': member.groupStatus === 'rejected',
                                    'text-primary-500': member.groupStatus === 'owner'
                                }"
                                class="text-sm font-medium"
                            >
                                {{ member.groupStatus ? (member.groupStatus.charAt(0).toUpperCase() + member.groupStatus.slice(1)) : 'Unknown' }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div v-if="isOwner() && group.members.some(m => m.groupStatus === 'pending')" class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Pending Requests</h2>
                    <div class="space-y-2">
                        <div v-for="member in group.members.filter(m => m.groupStatus === 'pending')" :key="typeof member.memberId === 'string' ? member.memberId : member.memberId._id" class="flex justify-between items-center p-2 bg-surface-700/50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center">
                                    <Icon name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                                </div>
                                <span>{{ typeof member.memberId === 'string' ? member.memberId : member.memberId.username }}</span>
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    @click="handleMemberStatus(typeof member.memberId === 'string' ? member.memberId : member.memberId._id, 'accepted')"
                                    class="p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                >
                                    <Icon name="material-symbols:check" size="1.25rem" />
                                </button>
                                <button 
                                    @click="handleMemberStatus(typeof member.memberId === 'string' ? member.memberId : member.memberId._id, 'rejected')"
                                    class="p-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    <Icon name="material-symbols:close" size="1.25rem" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center p-12">
        <Icon name="material-symbols:error" size="3rem" class="text-red-500 mb-4" />
        <h2 class="text-xl font-bold mb-2">Group Not Found</h2>
        <p class="text-gray-400 mb-6">The group you're looking for doesn't exist or has been deleted.</p>
        <NuxtLink to="/dashboard/groups" class="text-primary-500 hover:text-primary-400 transition-colors">
            Return to Groups
        </NuxtLink>
    </div>
</template>