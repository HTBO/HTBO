export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore();

    try {
        authStore.initializeAuth();
        
        if(authStore.isAuthenticated){
            const user = await useUserApi().getMe();
            if(user) {
                authStore.setUser(user);
                authStore.startRefreshTokenTimer();
            }
        }
    } finally {
        authStore.initialized = true;
    }
});