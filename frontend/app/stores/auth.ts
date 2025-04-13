import type { User } from "~/types/User";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        initialized: false,
        token: null as string | null,
        user: null as User | null,
        refreshTokenTimeout: null as NodeJS.Timeout | null,
    }),
    actions: {
        initializeAuth() {
            const cookie = document.cookie.split('; ').find(row => row.startsWith('authToken='))
            this.token = cookie ? cookie.split('=')[1] ?? null : null
            if(this.token)
                this.initialized = true
        },
        setToken(token: string) {
            this.token = token
            document.cookie = `authToken=${token}; path=/; max-age=3600` // 1 hour
            this.startRefreshTokenTimer();
        },
        setUser(user: User | null) {
            this.user = user
        },
        clearAuth(){
            this.token = null
            this.user = null
            document.cookie = 'authToken=; path=/; max-age=0'
            this.stopRefreshTokenTimer();
        },
        startRefreshTokenTimer() {
            const refreshTime = 55 * 60 * 1000;
            this.stopRefreshTokenTimer();
            this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), refreshTime);
        },

        stopRefreshTokenTimer() {
            if (this.refreshTokenTimeout) {
                clearTimeout(this.refreshTokenTimeout);
                this.refreshTokenTimeout = null;
            }
        },

        async refreshToken() {
            try {
                const data = await useUserApi().refreshToken();
                if (data?.token) {
                    this.setToken(data.token);
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                this.clearAuth();
                navigateTo('/auth/login');
            }
        },

        async refreshUser() {
            try {
                const user = await useUserApi().getMe();
                if (user) {
                    this.setUser(user);
                }
            } catch (error) {
                console.error('Error refreshing user:', error);
            }
        }

    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
        getToken: (state) => state.token,
    }
});