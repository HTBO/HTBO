export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore();

    try {
        authStore.initializeAuth();
        
        if(authStore.isAuthenticated){
            const { data: user } = await useUserApi().getMe();
            if(user.value) {
                authStore.setUser(user.value);
            }
        }
    } finally {
        authStore.initialized = true;
    }
});