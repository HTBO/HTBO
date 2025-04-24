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

    const getGameById = (id: string) => {
        return $fetch<Game[]>(`${API_URL}/search`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: { id },
        }).then((response) => {
            return response[0];
        });
    };

    return {
        searchGame,
        getGameById,
    }
};