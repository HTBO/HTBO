import type { Session } from "~/types/Session";

export const useSessionApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/sessions`;

    const { getAuthHeaders } = useUserUtils();

    // GET
    const getSessionById = (id: string) => {
        return $fetch<Session>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    // POST 
    const createSession = (sessionData: {
        hostId: string;
        gameId: number;
        scheduledAt: Date;
        description: string;
        participants: Array<{ user?: string; group?: string; }>;
    }) => {
        return $fetch<Session>(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: sessionData
        });
    };

    const confirmSession = (data: { userId: string; sessionId: string }) => {
        return $fetch<Session>(`${API_URL}/confirm`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: data
        });
    };

    const rejectSession = (data: { userId: string; sessionId: string }) => {
        return $fetch<Session>(`${API_URL}/reject`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: data
        });
    };

    // PATCH
    const updateSession = (
        id: string,
        updateData: {
            gameId?: string;
            scheduledAt?: string;
            description?: string;
            addParticipant?: Array<{ user?: string; group?: string; }>;
            removeParticipant?: Array<{ user?: string; group?: string; }>;
        }
    ) => {
        return $fetch<Session>(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: updateData
        });
    };

    // DELETE session
    const deleteSession = (id: string) => {
        return $fetch<void>(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
    };

    return {
        getSessionById,
        createSession,
        confirmSession,
        rejectSession,
        updateSession,
        deleteSession,
    };
};