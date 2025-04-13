import type { Group } from '~/types/Group';

export const useGroupApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/groups`;

    const { getAuthHeaders } = useUserUtils();
    
    const authStore = useAuthStore();
    const toast = useToast();

    // GET methods
    const getGroupById = (id: string) => {
        return $fetch<Group>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    // POST methods
    const createGroup = async (groupData: any) => {
        try {
            const response = await $fetch<Group>(`${API_URL}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: groupData
            });
            
            if (response) {
                await authStore.refreshUser();
                toast.add({
                    title: 'Success',
                    description: 'Group created successfully',
                    color: 'success'
                });
                return response;
            }
            return null;
        } catch (error) {
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
            
            if (response) {
                await authStore.refreshUser();
                toast.add({
                    title: 'Success',
                    description: 'You joined the group',
                    color: 'success'
                });
                return true;
            }
            return false;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to join group',
                color: 'error'
            });
            return false;
        }
    };

    const rejectGroup = async (groupId: string, userId: string) => {
        try {
            const response = await $fetch(`${API_URL}/reject`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: { groupId, userId }
            });
            
            if (response) {
                await authStore.refreshUser();
                toast.add({
                    title: 'Success',
                    description: 'You left the group',
                    color: 'success'
                });
                return true;
            }
            return false;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to leave group',
                color: 'error'
            });
            return false;
        }
    };

    // PATCH methods
    const updateGroup = async (id: string, groupData: Partial<Group>) => {
        try {
            const response = await $fetch<Group>(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: groupData
            });
            
            if (response) {
                toast.add({
                    title: 'Success',
                    description: 'Group updated successfully',
                    color: 'success'
                });
                return response;
            }
            return null;
        } catch (error) {
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
            
            if (response) {
                toast.add({
                    title: 'Success',
                    description: 'Members added successfully',
                    color: 'success'
                });
                return response;
            }
            return null;
        } catch (error) {
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
            
            if (response) {
                toast.add({
                    title: 'Success',
                    description: 'Members removed successfully',
                    color: 'success'
                });
                return response;
            }
            return null;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to remove members',
                color: 'error'
            });
            return null;
        }
    };

    // DELETE methods
    const deleteGroup = async (id: string) => {
        try {
            const response = await $fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response) {
                await authStore.refreshUser();
                toast.add({
                    title: 'Success',
                    description: 'Group deleted successfully',
                    color: 'success'
                });
                return true;
            }
            return false;
        } catch (error) {
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