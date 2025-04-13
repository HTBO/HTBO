import type { Session } from "~/types/Session";

export const useSessionApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/sessions`;

    const { getAuthHeaders } = useUserUtils();

    const getSessionById = (id: string) => {
        return $fetch<Session>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    return {
        getSessionById
    };
};