export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if (import.meta.client && !authStore.isAuthenticated) {
        return navigateTo('/login')
    }
})