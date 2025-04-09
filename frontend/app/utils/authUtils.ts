export const getAuthHeaders = () => {
    const authStore = useAuthStore();
    return {
        Authorization: `Bearer ${authStore.token}`,
    };
};

export const getUserId = () => {
    const authStore = useAuthStore();
    return authStore.user?._id;
}