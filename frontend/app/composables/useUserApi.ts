import type { User } from "~/types/User"

export const useUserApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/users`;

    const authStore = useAuthStore();
    const router = useRouter();

    const logout = async () => {
        const res = await $fetch(`${API_URL}/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        })
        if (res) {
            authStore.clearAuth();
            router.push("/login");
        }
    }
    
    const fetchMe = (token: string) => {
        return useLazyFetch<User>(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    }


    const fetchUserByUsername = (username: string) => {
        return useLazyFetch(`${API_URL}/username/${username}`, {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            }
        })
    }

    return {
        logout,
        fetchMe,
        fetchUserByUsername,
    }
}