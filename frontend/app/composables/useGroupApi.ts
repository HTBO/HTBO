import type { Group } from '~/types/Group';

export const useGroupApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/groups`;

    const { getAuthHeaders } = useUserUtils();

    const authStore = useAuthStore();
    const toast = useToast();
    const router = useRouter();

    // GET
    const getGroupById = (id: string) => {
        return $fetch<Group>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    // POST
    const createGroup = async (groupData: any) => {
        try {
            const response = await $fetch<Group>(`${API_URL}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: groupData
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Group created successfully',
                color: 'success'
            });
            router.push('/dashboard/groups');
            return response;
        } catch (error) {
            console.error('Error creating group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to create group',
                color: 'error'
            });
            return null;
        }
    };

    const joinGroup = async (groupId: string, userId: string) => {
        try {
            const response = await $fetch(`${API_URL}/confirm`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: { groupId, userId }
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'You joined the group',
                color: 'success'
            });
            return true;
        } catch (error) {
            console.error('Error joining group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to join group',
                color: 'error'
            });
            return false;
        }
    };

    const rejectGroup = async (groupId: string, userId: string, action: 'reject' | 'leave') => {
        try {
            const response = await $fetch(`${API_URL}/reject`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: { groupId, userId }
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: action === 'reject' ? 'Group request rejected' : 'You left the group',
                color: 'success'
            });
            router.push('/dashboard/groups');
            return true;
        } catch (error) {
            console.error('Error rejecting group:', error);
            toast.add({
                title: 'Error',
                description: action === 'reject' ? 'Failed to reject group request' : 'Failed to leave group',
                color: 'error'
            });
            return false;
        }
    };

    // PATCH
    const updateGroup = async (id: string, groupData: Partial<Group>) => {
        try {
            const response = await $fetch<Group>(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: groupData
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Group updated successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error updating group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to update group',
                color: 'error'
            });
            return null;
        }
    };

    const addMembersToGroup = async (groupId: string, memberIds: string[]) => {
        try {
            const addMembers = memberIds.map(memberId => ({ memberId }));
            const response = await $fetch<Group>(`${API_URL}/${groupId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: { addMember: addMembers }
            });
            toast.add({
                title: 'Success',
                description: 'Members added successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error adding members to group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to add members',
                color: 'error'
            });
            return null;
        }
    };

    const removeMembersFromGroup = async (groupId: string, memberIds: string[]) => {
        try {
            const removeMembers = memberIds.map(memberId => ({ memberId }));
            const response = await $fetch<Group>(`${API_URL}/${groupId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: { removeMember: removeMembers }
            });
            toast.add({
                title: 'Success',
                description: 'Members removed successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error removing members from group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to remove members',
                color: 'error'
            });
            return null;
        }
    };

    // DELETE
    const deleteGroup = async (id: string) => {
        try {
            const response = await $fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Group deleted successfully',
                color: 'success'
            });
            router.push('/dashboard/groups');
            return true;
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to delete group',
                color: 'error'
            });
            return false;
        }
    };

    return {
        // GET
        getGroupById,

        // POST
        createGroup,
        joinGroup,
        rejectGroup,

        // PATCH
        updateGroup,
        addMembersToGroup,
        removeMembersFromGroup,

        // DELETE
        deleteGroup
    };
};