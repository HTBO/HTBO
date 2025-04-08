import type { User } from "~/types/User"
import { getAuthHeaders } from "~/utils/authUtils";

export const useUserApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/users`;

    const authStore = useAuthStore();
    const router = useRouter();

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

    return {
        logout,
        getMe,
        getAllUsers,
        getUserById,
        getUserByUsername,
    };
};