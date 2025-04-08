import type { Session } from "~/types/Session";
import { getAuthHeaders } from "~/utils/authUtils";

export const useSessionApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/sessions`;

    const getSessionById = (id: string) => {
        return $fetch<Session>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    return {
        getSessionById
    };
};