import type { Game } from "~/types/Game";

export const useGameApi = () => {
    const runtimeConfig = useRuntimeConfig();
    const API_URL = `${runtimeConfig.public.apiBaseUrl}/games`;

    const { getAuthHeaders } = useUserUtils();

    const searchGame = (query: string) => {
        return $fetch<Game[]>(`${API_URL}/search`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: { name: query },
        });
    }

    const getGameById = async (id: string) => {
        const response = await $fetch<Game[]>(`${API_URL}/search`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: { id },
        });
        return response[0];
    };

    return {
        searchGame,
        getGameById,
    }
};