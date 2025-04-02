export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore();
    authStore.initializeAuth();

    if(authStore.isAuthenticated){
        const { data: user } = await useUserApi().fetchMe();
        if(user.value) {
            authStore.setUser(user.value);
        }
    }
});