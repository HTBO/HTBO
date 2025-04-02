export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if (import.meta.client) {
        if(!authStore.isAuthenticated) {
            console.log('User is not authenticated, redirecting to login page')
            return navigateTo('/login')
        }
    }
})