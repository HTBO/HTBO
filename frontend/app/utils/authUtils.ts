export const getAuthHeaders = () => {
    const authStore = useAuthStore();
    return {
        Authorization: `Bearer ${authStore.token}`,
    };
};