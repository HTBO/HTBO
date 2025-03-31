export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null as string | null,
        user: null,
    }),
    actions: {
        setToken(token: string) {
            this.token = token
        },
        setUser(user: any) {
            this.user = user
        },
        clearAuth(){
            this.token = null
            this.user = null
        }
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
        getToken: (state) => state.token,
    }
});