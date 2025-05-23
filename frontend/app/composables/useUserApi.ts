import type { TokenResponse } from "~/types/Response";
import type { User } from "~/types/User"

export const useUserApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/users`;

    const { getAuthHeaders, getUserId } = useUserUtils();

    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();

    // GET
    const getAllUsers = () => {
        return $fetch<User[]>(`${API_URL}`, {
            headers: getAuthHeaders(),
        });
    };

    const getUserById = (id: string) => {
        return $fetch<User>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    const getUserByUsername = (username: string) => {
        return $fetch<User>(`${API_URL}/username/${username}`, {
            headers: getAuthHeaders(),
        });
    };

    const getMe = () => {
        return $fetch<User>(`${API_URL}/me`, {
            headers: getAuthHeaders(),
        });
    };

    const getMySessions = () => {
        return $fetch<any[]>(`${API_URL}/mysessions`, {
            headers: getAuthHeaders(),
        });
    };

    const getMyGroups = () => {
        return $fetch<any[]>(`${API_URL}/mygroups`, {
            headers: getAuthHeaders(),
        });
    };

    const getMyGames = () => {
        return $fetch<any[]>(`${API_URL}/mygames`, {
            headers: getAuthHeaders(),
        });
    };

    // POST
    const registerUser = async (userData: { username: string, email: string, password: string }) => {
        try {
            const response = await $fetch<TokenResponse>(`${API_URL}/register`, {
                method: 'POST',
                body: userData
            });
            toast.add({
                title: 'Success',
                description: 'Registration successful',
                color: 'success'
            });
            return response;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Registration failed',
                color: 'error'
            });
            return null;
        }
    };

    const loginUser = async (credentials: { username?: string, email?: string, password: string }) => {
        try {
            const response = await $fetch<TokenResponse>(`${API_URL}/login`, {
                method: 'POST',
                body: credentials
            });
            authStore.setToken(response.token);
            toast.add({
                title: 'Success',
                description: 'Login successful',
                color: 'success'
            });
            return response;
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'Login failed',
                color: 'error'
            });
            return null;
        }
    };

    const logout = async () => {
        try {
            const response = await $fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            authStore.clearAuth();
            router.push('/login');
            toast.add({
                title: 'Success',
                description: 'Logout successful',
                color: 'success'
            });
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            toast.add({
                title: 'Error',
                description: 'Logout failed',
                color: 'error'
            });
            return false;
        }
    };

    const refreshToken = async () => {
        try {
            const response = await $fetch<TokenResponse>(`${API_URL}/refresh`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            toast.add({
                title: 'Error',
                description: 'Token refresh failed',
                color: 'error'
            });
            return null;
        }
    };

    // PATCH
    const updateUser = async (id: string, userData: Partial<User>) => {
        try {
            const response = await $fetch<User>(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: userData
            });
            authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'User updated successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to update user',
                color: 'error'
            });
            return null;
        }
    };

    const addFriend = async (friendId: string) => {
        try {
            const response = await $fetch<User>(`${API_URL}/${getUserId()}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: {
                    friendAction: {
                        action: 'add',
                        friendId
                    }
                }
            });
            authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Friend request sent successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to send friend request',
                color: 'error'
            });
            return null;
        }
    };

    const updateFriendStatus = async (friendId: string, friendStatus: 'accepted' | 'rejected') => {
        try {
            const response = await $fetch<User>(`${API_URL}/${getUserId()}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: {
                    friendAction: {
                        action: 'update-status',
                        friendId,
                        friendStatus
                    }
                }
            });
            authStore.refreshUser();
            const action = friendStatus === 'accepted' ? 'accepted' : 'rejected';
            toast.add({
                title: 'Success',
                description: `Friend request ${action} successfully`,
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error updating friend request:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to update friend request',
                color: 'error'
            });
            return null;
        }
    };

    const removeFriend = async (friendId: string) => {
        try {
            const response = await $fetch<User>(`${API_URL}/${getUserId()}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: {
                    friendAction: {
                        action: 'remove',
                        friendId
                    }
                }
            });
            authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Friend removed successfully',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error removing friend:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to remove friend',
                color: 'error'
            });
            return null;
        }
    };

    // DELETE
    const deleteUser = async (id: string) => {
        try {
            const response = await $fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            authStore.clearAuth();
            router.push('/login');
            toast.add({
                title: 'Success',
                description: 'User deleted successfully',
                color: 'success'
            });
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to delete user',
                color: 'error'
            });
            return false;
        }
    };

    return {
        // GET
        getAllUsers,
        getUserById,
        getUserByUsername,
        getMe,
        getMySessions,
        getMyGroups,
        getMyGames,

        // POST
        registerUser,
        loginUser,
        logout,
        refreshToken,

        // PATCH
        updateUser,
        addFriend,
        updateFriendStatus,
        removeFriend,

        // DELETE
        deleteUser
    };
};