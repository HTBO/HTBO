<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBaseUrl;

definePageMeta({
    layout: 'blank'
})

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

async function signUp() {
    if (!username.value) {
        errorMessage.value = 'Username is required';
        return;
    }
    if (!email.value) {
        errorMessage.value = 'Email is required';
        return;
    }
    if (!password.value) {
        errorMessage.value = 'Password is required';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username.value, email: email.value, password: password.value }),
        });

        if (!response.ok) {
            const data = await response.json();
            errorMessage.value = data.error;
            throw new Error('Registration failed');
        }

        const data = await response.json();
        // Handle successful login (e.g., store tokens, redirect)
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
    } catch (error) {
        console.error('Error during login:', error);
        // Handle login error (e.g., show error message)
    }
};
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-5 min-h-screen">
        <div class="w-full max-w-md p-10 space-y-6 bg-surface-900 rounded-xl shadow-2xl shadow-black/50">
            <div class="space-y-2.5">
                <h2 class="text-2xl font-bold">Welcome to HTBO!</h2>
                <h3 class="text-gray-400">Create your first account and start exploring</h3>
            </div>
            <form @submit.prevent="signUp" class="space-y-6">
                <div class="space-y-4">
                    <div>
                        <label for="username" class="text-sm text-gray-400">Username</label>
                        <input v-model="username" id="username" name="username" type="text" autocomplete="username" class="w-full mt-1.5 p-3 outline-none bg-surface-950 border-2 border-surface-800 focus-within:border-slate-200 duration-300 rounded-2xl sm:text-sm" placeholder="Enter your username">
                    </div>
                    <div>
                        <label for="email" class="text-sm text-gray-400">Email</label>
                        <input v-model="email" id="email" name="email" type="email" autocomplete="email" class="w-full mt-1.5 p-3 outline-none bg-surface-950 border-2 border-surface-800 focus-within:border-slate-200 duration-300 rounded-2xl sm:text-sm" placeholder="Enter your email">
                    </div>
                    <div>
                        <label for="password" class="text-sm text-gray-400">Password</label>
                        <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" class="w-full mt-1.5 p-3 outline-none bg-surface-950 border-2 border-surface-800 rounded-2xl focus-within:border-slate-300 duration-300 sm:text-sm" placeholder="Enter your password">
                    </div>
                </div>
                <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                        <input id="remember" name="remember" type="checkbox" class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500" />
                        <label for="remember" class="text-sm text-gray-400">Remember me</label>
                    </div>
                    <div class="text-sm">
                        <NuxtLink to="/forgot-password" class="text-primary-500 hover:text-primary-500/80 duration-300">Forgot password?</NuxtLink>
                    </div>
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
            <!-- <div class="flex items-center justify-center">
                <button @click="loginWithGoogle" class="flex items-center justify-center w-full px-4 py-2.5 font-medium border rounded-md">
                    <Icon name="devicon:google" class="w-6 h-6 mr-2" />
                    Bejelentkezés Google-fiókkal
                </button>
            </div> -->
        </div>
        <div v-if="errorMessage" id="error-message" class="max-w-md w-full p-3 border border-red-500/50 bg-red-500/30 rounded-xl">
            <p class="text-center text-red-200">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<style scoped></style>