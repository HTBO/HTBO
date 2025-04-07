export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if(import.meta.client){
        if(!authStore.initialized) {
            return navigateTo('/loading')
        }
    
        if(!authStore.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
            return navigateTo('/login')
        }
    }
})