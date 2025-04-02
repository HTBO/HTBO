export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    authStore.initializeAuth();

    if(authStore.isAuthenticated){
        const { data: user } = useUserApi().fetchMe();
        if(user.value) {
            authStore.setUser(user.value);
        }
    }
});