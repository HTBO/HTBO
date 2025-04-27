<script setup lang="ts">
import type { Group } from '~/types/Group';
import { groupTabs } from '~/constants/Tab';
import type { Tab } from '~/types/Tab';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const authStore = useAuthStore();
const groups = ref<Group[]>([]);
const filteredGroups = ref<Group[]>([]);
const isLoading = ref(true);
const searchValue = useState<string>('searchValue', () => '');

const activeTab = ref<Tab | null>(groupTabs[0] ?? null);

const emptyMessage = computed(() => {
    if (isLoading.value) return 'Loading groups...';
    
    const hasSearch = !!searchValue.value;
    const hasGroups = groups.value.length > 0;
    const hasFilteredGroups = filteredGroups.value.length > 0;
    
    switch (activeTab.value?.name) {
        case 'All Groups':
            return !hasGroups ? 'No groups available yet' : 
                         hasSearch && !hasFilteredGroups ? `No groups match "${searchValue.value}"` : 
                         'No groups to display';
            
        case 'Owned Groups':
            return hasSearch && !hasFilteredGroups ? `No owned groups match "${searchValue.value}"` : 
                         'You haven\'t created any groups yet';
            
        case 'Group Invites':
            return hasSearch && !hasFilteredGroups ? `No invites match "${searchValue.value}"` : 
                         'You don\'t have any pending group invitations';
            
        default:
            return 'No groups to display';
    }
});

const displayedGroups = computed(() => {
    if (!activeTab.value) return filteredGroups.value;
    
    const userId = authStore.user?._id;
    
    switch (activeTab.value.name) {
        case 'All Groups':
            return filteredGroups.value.filter(group => 
                !group.members.some(member => 
                    member.memberId === userId && member.groupStatus === 'pending'
                )
            );
            
        case 'Owned Groups':
            return filteredGroups.value.filter(group => group.ownerId === userId);
            
        case 'Group Invites':
            return filteredGroups.value.filter(group => 
                group.members.some(member => 
                    member.memberId === userId && member.groupStatus === 'pending'
                )
            );
            
        default:
            return filteredGroups.value;
    }
});

const loadGroups = async () => {
    isLoading.value = true;
    try {
        if (!authStore.user) return;
        const groupResponses = await Promise.all(authStore.user?.groups
            .map(async group => {
                return useGroupApi().getGroupById(group.groupId);
            })
        )
        groups.value = groupResponses || [];
        filteredGroups.value = groups.value;
    } catch (error) {
        console.error('Error loading groups:', error);
    } finally {
        isLoading.value = false;
    }
};

watch(searchValue, (newValue) => {
    if (newValue) {
        filteredGroups.value = groups.value.filter(group => 
            group.name.toLowerCase().includes(newValue.toLowerCase()) ||
            group.description.toLowerCase().includes(newValue.toLowerCase())
        );
    } else {
        filteredGroups.value = groups.value;
    }
});

onMounted(async () => {
    await authStore.refreshUser();
    loadGroups();
});

provide('refreshGroups', loadGroups);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Groups</h1>
            <NuxtLink 
                to="/dashboard/groups/create" 
                class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
            >
                <Icon name="icons:add" size="1.25rem" />
                <span>Create Group</span>
            </NuxtLink>
        </div>
        
        <TabNavigation :tabs="groupTabs" @update:active-tab="activeTab = $event" />

        <SectionsGroups 
            :groups="displayedGroups"
            :is-loading="isLoading"
            :empty-message="emptyMessage"
            :show-create-group-link="groups.length === 0 && activeTab?.name === 'All Groups'"
        />
    </div>
</template>