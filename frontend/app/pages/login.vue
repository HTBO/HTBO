<script setup lang="ts">

definePageMeta({
    layout: 'blank'
});

const authStore = useAuthStore();
const router = useRouter();
const { loginUser } = useUserApi();

const emailOrUsername = ref('');
const password = ref('');
const errorMessage = ref('');

if (authStore.isAuthenticated) {
    router.push('/dashboard');
}

async function signIn() {
    if (!emailOrUsername.value) {
        errorMessage.value = 'Email or username is required';
        return;
    }
    if (!password.value) {
        errorMessage.value = 'Password is required';
        return;
    }

    errorMessage.value = '';
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername.value);
    const credentials = isEmail
        ? { email: emailOrUsername.value, password: password.value }
        : { username: emailOrUsername.value, password: password.value };

    try {
        const response = await loginUser(credentials);
        
        if (response) {
            const user = await useUserApi().getMe();
            authStore.setUser(user);
            router.push('/dashboard');
        } else {
            errorMessage.value = 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.value = 'An unexpected error occurred';
    }
};
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-5 min-h-screen">
        <div class="w-full max-w-md p-10 space-y-6 bg-surface-900 rounded-xl shadow-2xl shadow-black/50">
            <div class="space-y-2.5">
                <h2 class="text-2xl font-bold">Welcome back</h2>
                <h3 class="text-gray-400">Please enter your details to sign in</h3>
            </div>
            <form @submit.prevent="signIn" class="space-y-6">
                <div>
                    <label for="emailOrUsername" class="text-sm text-gray-400">Email or username</label>
                    <input v-model="emailOrUsername" id="emailOrUsername" name="emailOrUsername" type="text" autocomplete="username" class="w-full mt-1.5 p-3 outline-none bg-surface-950 border-2 border-surface-800 focus-within:border-slate-200 duration-300 rounded-2xl sm:text-sm" placeholder="Enter your email or username">
                </div>
                <div>
                    <label for="password" class="text-sm text-gray-400">Password</label>
                    <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" class="w-full mt-1.5 p-3 outline-none bg-surface-950 border-2 border-surface-800 rounded-2xl focus-within:border-slate-300 duration-300 sm:text-sm" placeholder="••••••••">
                </div>
                <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                        <input id="remember" name="remember" type="checkbox" class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500" />
                        <label for="remember" class="text-sm text-gray-400">Remember me</label>
                    </div>
                    <!-- <div class="text-sm">
                        <NuxtLink to="/login" class="text-primary-500 hover:text-primary-500/80 duration-300">Forgot password?</NuxtLink>
                    </div> -->
                </div>
                <div>
                    <button type="submit" class="w-full p-3.5 bg-primary-600 hover:bg-primary-600/80 font-medium shadow-xl shadow-primary-600/25 rounded-2xl duration-300">
                        Sign in
                    </button>
                </div>
            </form>
            <div>
                <p class="text-sm text-center text-gray-400">Don't have an account? <NuxtLink to="/register"><span class="text-primary-500 hover:text-primary-500/80 duration-300">Sign up</span></NuxtLink>
                </p>
            </div>
        </div>
        <div v-if="errorMessage" id="error-message" class="max-w-md w-full p-3 border border-red-500/50 bg-red-500/30 rounded-xl">
            <p class="text-center text-red-200">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<style scoped></style>
