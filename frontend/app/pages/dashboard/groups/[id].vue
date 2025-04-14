<script setup lang="ts">
import type { Group } from '~/types/Group';
import type { User } from '~/types/User';
import { membersTabs } from '~/constants/Tab';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute();
const router = useRouter();
const { id } = route.params;

const authStore = useAuthStore();

const toast = useToast();

const { getUserById } = useUserApi();
const { getGroupById, joinGroup, rejectGroup, updateGroup, deleteGroup } = useGroupApi();

const isLoading = ref(true);
const group = ref<Group | null>(null);
const members = ref<User[]>([]);

const activeMembersTab = ref(membersTabs[0]);

const filteredMembers = computed(() => {
    if (!group.value) return [];

    switch (activeMembersTab.value?.name) {
        case 'Active':
            return group.value.members.filter(member =>
                member.groupStatus === 'accepted' || member.groupStatus === 'owner');
        case 'Pending':
            return group.value.members.filter(member =>
                member.groupStatus === 'pending');
        default:
            return group.value.members;
    }
});

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
        if (!group.value?.members) return;
        const memberIds = group.value?.members.map(member =>
            typeof member.memberId === 'string' ? member.memberId : member.memberId._id
        ) || [];
        const membersResponse = await Promise.all(
            memberIds.map(async (memberId) => {
                const user = await getUserById(memberId);
                return user;
            })
        );
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
        return await joinGroup(group.value?._id, authStore.user?._id);
    } catch (error) {
        console.error('Error joining group:', error);
    }
};

const handleLeaveGroup = async () => {
    try {
        if (!group.value || !authStore.user) return;
        if (confirm('Are you sure you want to leave this group?')) {
            return await rejectGroup(group.value?._id, authStore.user?._id);
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
                router.push('/dashboard/groups');
            }
        }
    } catch (error) {
        console.error('Error deleting group:', error);
    }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
};

const acceptedMembersCount = computed(() => {
    if (!group.value) return 0;
    return group.value.members.filter(member => member.groupStatus === 'accepted').length;
});

const getMemberId = (memberData: any): string => {
    return typeof memberData.memberId === 'string'
        ? memberData.memberId
        : memberData.memberId._id;
};

const getMemberUser = (memberData: any): User | undefined => {
    const memberId = getMemberId(memberData);
    return members.value.find(user => user._id === memberId);
};

const getMemberUsername = (memberData: any): string => {
    const member = getMemberUser(memberData);
    if (member) return member.username;

    if (typeof memberData.memberId === 'object' && memberData.memberId.username) {
        return memberData.memberId.username;
    }

    return `Member (${getMemberId(memberData).substring(0, 8)}...)`;
};

onMounted(loadGroup);
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else-if="group" class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
                <NuxtLink to="/dashboard/groups" class="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                    <Icon name="material-symbols:arrow-back" size="1.5rem" />
                </NuxtLink>
                <h1 class="text-2xl font-bold">Group Details</h1>
            </div>

            <div class="flex gap-3">
                <button v-if="isOwner()" @click="handleDeleteGroup" class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300">
                    <Icon name="material-symbols:delete" size="1.25rem" />
                    <span>Delete Group</span>
                </button>

                <button v-if="isOwner()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                    <Icon name="material-symbols:edit" size="1.25rem" />
                    <span>Edit Group</span>
                </button>

                <div v-else-if="isPending()" class="flex gap-3">
                    <button @click="handleLeaveGroup" class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300">
                        <Icon name="material-symbols:cancel" size="1.25rem" />
                        <span>Cancel Request</span>
                    </button>

                    <button @click="handleJoinGroup" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg duration-300">
                        <Icon name="material-symbols:add" size="1.25rem" />
                        <span>Join Group</span>
                    </button>
                </div>


                <button v-if="isMember()" @click="handleLeaveGroup" class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300">
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
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Members</h2>
      <div v-if="isOwner()" class="text-sm text-primary-500 hover:text-primary-400 cursor-pointer">
        <Icon name="material-symbols:add" class="inline" /> Add Members
      </div>
    </div>
    
    <TabNavigation 
      :tabs="membersTabs" 
      @update:active-tab="activeMembersTab = $event" 
    />
    
    <div class="mt-4 space-y-2">
      <div v-if="filteredMembers.length === 0" class="text-gray-400">
        {{ activeMembersTab?.name === 'Pending' ? 'No pending requests' : 'No members yet' }}
      </div>

      <div v-for="memberData in filteredMembers" 
          :key="typeof memberData.memberId === 'string' ? memberData.memberId : memberData.memberId._id" 
          class="flex justify-between items-center p-2 bg-surface-700/50 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center overflow-hidden">
            <!-- Get the member from the members array to access user details -->
            <template v-if="getMemberUser(memberData)">
              <img v-if="getMemberUser(memberData)?.avatarUrl" 
                :src="getMemberUser(memberData)?.avatarUrl" 
                alt="Profile Picture" 
                class="w-full h-full object-cover" />
              <Icon v-else name="material-symbols:person" size="1.25rem" class="text-gray-300" />
            </template>
            <Icon v-else name="material-symbols:person" size="1.25rem" class="text-gray-300" />
          </div>
          <span>{{ getMemberUsername(memberData) }}</span>
        </div>
        
        <div class="flex items-center gap-3">
          <span :class="{
            'text-green-500': memberData.groupStatus === 'accepted',
            'text-yellow-500': memberData.groupStatus === 'pending',
            'text-red-500': memberData.groupStatus === 'rejected',
            'text-primary-500': memberData.groupStatus === 'owner'
          }" class="text-sm font-medium">
            {{ memberData.groupStatus ? (memberData.groupStatus.charAt(0).toUpperCase() + memberData.groupStatus.slice(1)) : 'Unknown' }}
          </span>
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