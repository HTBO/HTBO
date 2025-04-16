<script setup lang="ts">
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
const availableFriends = ref<User[]>([]);

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
            members: selectedMembers.value.map(memberId => ({ memberId }))
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
            <div class="bg-surface-900/70 p-6 shadow-xl rounded-2xl">
                <form @submit.prevent="createNewGroup" class="space-y-6">
                    <div>
                        <label for="groupName" class="block text-sm font-medium text-gray-300 mb-1">Group Name *</label>
                        <input v-model="groupName" id="groupName" type="text" class="w-full p-3 bg-surface-950 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none transition-colors" placeholder="Enter group name" />
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea v-model="description" id="description" rows="4" class="w-full p-3 bg-surface-950 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none transition-colors resize-none" placeholder="Describe your group"></textarea>
                    </div>

                    <MemberSelector v-model:selectedMembers="selectedMembers" :available-friends="availableFriends" :is-loading="isLoading" label="Members" :show-label="true"/>

                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" @click="router.push('/dashboard/groups')" class="px-5 py-2 border border-primary-700 rounded-xl hover:bg-surface-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl" :disabled="isLoading">
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