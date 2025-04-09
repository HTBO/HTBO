import type { TokenResponse } from "~/types/Response";
import type { User } from "~/types/User"
import { getAuthHeaders } from "~/utils/authUtils";

export const useUserApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/users`;

    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();

    const logout = async () => {
        try {
            const res = await $fetch(`${API_URL}/logout`, {
                method: "POST",
                headers: getAuthHeaders(),
            });
            if (res) {
                authStore.clearAuth();
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refreshToken = async () => {
        return useFetch<TokenResponse>(`${API_URL}/refresh`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
    };

    const getMe = () => {
        return useLazyFetch<User>(`${API_URL}/me`, {
            headers: getAuthHeaders(),
        });
    };

    const getAllUsers = () => {
        return $fetch<User[]>(`${API_URL}`, {
            headers: getAuthHeaders(),
        });
    }

    const getUserById = (id: string) => {
        return $fetch<User>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    const getUserByUsername = (username: string) => {
        return useLazyFetch<User>(`${API_URL}/username/${username}`, {
            headers: getAuthHeaders(),
        });
    };

    const addFriend = async (userId: string) => {
        try {
            const res = await $fetch(`${API_URL}/${getUserId()}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: {
                    friendAction: {
                        action: "add",
                        friendId: userId,
                    }
                }
            });
            if (res) {
                toast.add({title: 'Success', description: 'Friend added successfully', color: 'success'});
                return true;
            }
            return false;
        }
        catch (error) {
            toast.add({title: 'Error', description: 'An error occurred while sending the friend request', color: 'error'});
            return false;
        }
    };

    const cancelFriendRequest = async (userId: string) => {
        try {
            const res = await $fetch(`${API_URL}/${getUserId()}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: {
                    friendAction: {
                        action: "remove",
                        friendId: userId,
                    }
                }
            });
            if (res) {
                toast.add({title: 'Success', description: 'Friend request cancelled successfully', color: 'success'});
                return true;
            }
            return false;
        }
        catch (error) {
            toast.add({title: 'Error', description: 'An error occurred while cancelling the friend request', color: 'error'});
            return false;
        }
    };

    return {
        logout,
        refreshToken,
        getMe,
        getAllUsers,
        getUserById,
        getUserByUsername,
        addFriend,
        cancelFriendRequest,
    };
};