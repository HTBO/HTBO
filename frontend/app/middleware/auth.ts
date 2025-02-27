export default defineNuxtRouteMiddleware((to) => {
    if (process.client) {
        const token = localStorage.getItem('token')
        if (!token && to.path !== '/login') {
            return navigateTo('/login')
        }
    }
})