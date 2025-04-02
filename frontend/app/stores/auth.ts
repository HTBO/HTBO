import type { User } from "~/types/User";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null as string | null,
        user: null as User | null,
    }),
    actions: {
        initializeAuth() {
            const cookie = document.cookie.split('; ').find(row => row.startsWith('authToken='))
            this.token = cookie ? cookie.split('=')[1] ?? null : null
        },
        setToken(token: string) {
            this.token = token
            document.cookie = `authToken=${token}; path=/; max-age=3600` // 1 hour
        },
        setUser(user: User | null) {
            this.user = user
        },
        clearAuth(){
            this.token = null
            this.user = null
            document.cookie = 'authToken=; path=/; max-age=0' // Clear the cookie
        }
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
        getToken: (state) => state.token,
    }
});