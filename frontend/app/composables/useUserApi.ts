import type { User } from "~/types/User"

export const useUserApi = () => {
    const runtimeConfig = useRuntimeConfig()
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/users`

    const fetchMe = async (token: string) => {
        return useLazyFetch<User>(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    }

    return {
        fetchMe,
    }
}