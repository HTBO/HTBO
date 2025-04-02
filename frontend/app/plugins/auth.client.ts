export default defineNuxtPlugin(() => {
    const route = useRoute();
    const authStore = useAuthStore();
    authStore.initializeAuth();

    if (route.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            navigateTo('/login');
            return;
        }
        const { data: user } = useUserApi().fetchMe();
        if (user.value) {
            authStore.setUser(user.value);
        }
    }
});