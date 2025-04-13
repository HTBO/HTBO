<script setup lang="ts">
import type { Group } from '~/types/Group';
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { createGroup } = useGroupApi();
const { getUserById } = useUserApi();

const groupName = ref('');
const description = ref('');
const selectedMembers = ref<string[]>([]);
const isLoading = ref(false);
const showMemberSelector = ref(false);
const searchQuery = ref('');
const availableFriends = ref<User[]>([]);

const filteredFriends = computed(() => {
    if (!searchQuery.value) return availableFriends.value;

    const query = searchQuery.value.toLowerCase();
    return availableFriends.value.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
});

const toggleMemberSelection = (userId: string) => {
    const index = selectedMembers.value.indexOf(userId);
    if (index === -1) {
        selectedMembers.value.push(userId);
    } else {
        selectedMembers.value.splice(index, 1);
    }
};

const loadUsers = async () => {
    try {
        isLoading.value = true;
        
        if (!authStore.user?._id) return;
        
        const friendsStore = useFriendsStore();
        await friendsStore.fetchFriends(authStore.user);
        
        availableFriends.value = friendsStore.friendsByUser[authStore.user._id]?.friends || [];
    } catch (error) {
        console.error('Error loading friends:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load friends',
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};

const createNewGroup = async () => {
    try {
        if (!groupName.value.trim()) {
            toast.add({
                title: 'Error',
                description: 'Group name is required',
                color: 'error'
            });
            return;
        }

        if (!authStore.user?._id) {
            toast.add({
                title: 'Error',
                description: 'You must be logged in to create a group',
                color: 'error'
            });
            return;
        }

        isLoading.value = true;

        const groupData = {
            ownerId: authStore.user._id,
            name: groupName.value.trim(),
            description: description.value.trim(),
            members: selectedMembers.value.map(memberId => ({memberId}))
        };

        const result = await createGroup(groupData);
        
        if (result) {
            router.push('/dashboard/groups');
        }
    } catch (error) {
        console.error('Error creating group:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadUsers();
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <NuxtLink to="/dashboard/groups" class="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                <Icon name="material-symbols:arrow-back" size="1.5rem" />
            </NuxtLink>
            <h1 class="text-2xl font-bold">Create New Group</h1>
        </div>

        <div class="max-w-5xl mx-auto">
            <div class="bg-surface-800/70 p-6 rounded-2xl">
                <form @submit.prevent="createNewGroup" class="space-y-6">
                    <div>
                        <label for="groupName" class="block text-sm font-medium text-gray-300 mb-1">Group Name *</label>
                        <input v-model="groupName" id="groupName" type="text" class="w-full p-3 bg-surface-950 border-2 border-surface-700 rounded-xl focus:border-primary-500 outline-none transition-colors" placeholder="Enter group name" />
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea v-model="description" id="description" rows="4" class="w-full p-3 bg-surface-950 border-2 border-surface-700 rounded-xl focus:border-primary-500 outline-none transition-colors resize-none" placeholder="Describe your group"></textarea>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-sm font-medium text-gray-300">Members</label>
                            <button type="button" @click="showMemberSelector = !showMemberSelector" class="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
                                <Icon :name="showMemberSelector ? 'material-symbols:expand-less' : 'material-symbols:expand-more'" />
                                {{ showMemberSelector ? 'Hide' : 'Add Members' }}
                            </button>
                        </div>

                        <div v-if="selectedMembers.length > 0" class="mb-4 flex flex-wrap gap-2">
                            <div v-for="memberId in selectedMembers" :key="memberId" class="bg-surface-700 px-3 py-1 rounded-full flex items-center gap-1">
                                <span class="text-sm">{{availableFriends.find(u => u._id === memberId)?.username || memberId}}</span>
                                <button type="button" @click="toggleMemberSelection(memberId)" class="flex items-center text-gray-400 hover:text-white duration-300">
                                    <Icon name="material-symbols:close" size="1rem" />
                                </button>
                            </div>
                        </div>

                        <div v-if="showMemberSelector" class="border-2 border-surface-700 rounded-xl p-4 bg-surface-900 space-y-4">
                            <div class="relative">
                                <input v-model="searchQuery" type="text" class="w-full p-2 pl-8 bg-surface-950 border border-surface-700 rounded-lg focus:border-primary-500 outline-none" placeholder="Search friends..." />
                                <Icon name="material-symbols:search" size="1.25rem" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>

                            <div v-if="isLoading" class="flex justify-center py-4">
                                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                            </div>

                            <div v-else-if="filteredFriends.length === 0" class="text-center py-4 text-gray-400">
                                No friends found. Add friends to invite them to your group.
                            </div>

                            <div v-else class="max-h-64 overflow-y-auto space-y-2">
                                <div v-for="user in filteredFriends" :key="user._id" class="flex items-center justify-between p-2 hover:bg-surface-800 rounded-lg cursor-pointer transition-colors" @click="toggleMemberSelection(user._id)">
                                    <div class="flex items-center gap-3">
                                        <div class="size-8 bg-surface-600 rounded-full flex items-center justify-center">
                                            <Icon name="material-symbols:person" size="1rem" class="text-gray-300" />
                                        </div>
                                        <span>{{ user.username }}</span>
                                    </div>
                                    <div class="w-5 h-5 rounded border flex items-center justify-center" :class="selectedMembers.includes(user._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-500'">
                                        <Icon v-if="selectedMembers.includes(user._id)" name="material-symbols:check" size="0.875rem" class="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-4 pt-2">
                        <button type="button" @click="router.push('/dashboard/groups')" class="px-5 py-3 border border-surface-600 rounded-xl hover:bg-surface-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex-grow" :disabled="isLoading">
                            <span v-if="isLoading" class="flex items-center justify-center gap-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </span>
                            <span v-else>Create Group</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>