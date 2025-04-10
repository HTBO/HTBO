import type { Group } from '~/types/Group';
import { getAuthHeaders } from '~/utils/authUtils';

export const useGroupApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/groups`;
    const USER_API_URL = `${runtimeConfig.public.apiBaseUrl}/users`;
    
    const authStore = useAuthStore();
    const toast = useToast();

    const getAllGroups = () => {
        return $fetch<Group[]>(`${API_URL}`, {
            headers: getAuthHeaders(),
        });
    };

    const getMyGroups = () => {
        return useLazyFetch<Group[]>(`${USER_API_URL}/mygroups`, {
            headers: getAuthHeaders(),
        });
    };

    const getGroupById = (id: string) => {
        return $fetch<Group>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    const createGroup = async (groupData: Partial<Group>) => {
        try {
            const response = await $fetch<Group>(`${API_URL}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: groupData
            });
            
            if (response) {
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

    const deleteGroup = async (id: string) => {
        try {
            const response = await $fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response) {
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

    const joinGroup = async (groupId: string) => {
        try {
            const response = await $fetch(`${API_URL}/${groupId}/join`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            
            if (response) {
                await authStore.refreshUser();
                toast.add({
                    title: 'Success',
                    description: 'Group join request sent',
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

    const leaveGroup = async (groupId: string) => {
        try {
            const response = await $fetch(`${API_URL}/${groupId}/leave`, {
                method: 'PATCH',
                headers: getAuthHeaders()
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

    const updateMemberStatus = async (groupId: string, memberId: string, status: 'accepted' | 'rejected') => {
        try {
            const response = await $fetch(`${API_URL}/${groupId}/members/${memberId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: { status }
            });
            
            if (response) {
                toast.add({
                    title: 'Success',
                    description: `Member ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
                    color: 'success'
                });
                return true;
            }
            return false;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to update member status',
                color: 'error'
            });
            return false;
        }
    };

    return {
        getAllGroups,
        getMyGroups,
        getGroupById,
        createGroup,
        updateGroup,
        deleteGroup,
        joinGroup,
        leaveGroup,
        updateMemberStatus
    };
};