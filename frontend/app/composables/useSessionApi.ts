import type { Session } from "~/types/Session";

export const useSessionApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/sessions`;

    const authStore = useAuthStore();
    const { getAuthHeaders } = useUserUtils();

    const router = useRouter();
    const toast = useToast();

    // GET
    const getSessionById = (id: string) => {
        return $fetch<Session>(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    };

    // POST 
    const createSession = async (sessionData: {
        hostId: string;
        gameId: number;
        scheduledAt: Date;
        description: string;
        participants: Array<{ user?: string; group?: string; }>;
    }) => {
        try {
            const response = await $fetch<Session>(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: sessionData
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Session created successfully!',
                color: 'success'
            });
            router.push('/dashboard/sessions');
            return response;
        } catch (error) {
            console.error('Error creating session:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to create session',
                color: 'error'
            });
        }
    };

    const confirmSession = async (data: { userId: string; sessionId: string }) => {
        try {
            const response = await $fetch<Session>(`${API_URL}/confirm`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: data
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Session confirmed successfully!',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error confirming session:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to confirm session',
                color: 'error'
            });
        }
    };

    const rejectSession = async (data: { userId: string; sessionId: string }, action: 'reject' | 'leave') => {
        try {
            const response = await $fetch<Session>(`${API_URL}/reject`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: data
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: action === 'reject' ? 'Session rejected successfully!' : 'Session left successfully!',
                color: 'success'
            });
            router.push('/dashboard/sessions');
            return response;
        } catch (error) {
            console.error('Error rejecting session:', error);
            toast.add({
                title: 'Error',
                description: action === 'reject' ? 'Failed to reject session' : 'Failed to leave session',
                color: 'error'
            });
        }
    };

    // PATCH
    const updateSession = async (
        id: string,
        updateData: {
            gameId?: string;
            scheduledAt?: string;
            description?: string;
            addParticipant?: Array<{ user?: string; group?: string; }>;
            removeParticipant?: Array<{ user?: string; group?: string; }>;
        }
    ) => {
        try {
            const response = await $fetch<Session>(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: updateData
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Session updated successfully!',
                color: 'success'
            });
            return response;
        } catch (error) {
            console.error('Error updating session:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to update session',
                color: 'error'
            });
        }
    };

    // DELETE
    const deleteSession = async (id: string) => {
        try {
            const response = await $fetch<void>(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            await authStore.refreshUser();
            toast.add({
                title: 'Success',
                description: 'Session deleted successfully!',
                color: 'success'
            });
            router.push('/dashboard/sessions');
            return response;
        } catch (error) {
            console.error('Error deleting session:', error);
            toast.add({
                title: 'Error',
                description: 'Failed to delete session',
                color: 'error'
            });
        }
    };

    return {
        // GET
        getSessionById,

        // POST
        createSession,
        confirmSession,
        rejectSession,

        // PATCH
        updateSession,

        // DELETE
        deleteSession,
    };
};