<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBaseUrl;

definePageMeta({
    layout: 'blank'
})

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

async function signIn() {
    if (!email.value) {
        errorMessage.value = 'Email is required';
        return;
    }
    if (!password.value) {
        errorMessage.value = 'Password is required';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.value, password: password.value }),
        });

        if (!response.ok) {
            const data = await response.json();
            errorMessage.value = data.error;
            throw new Error('Login failed');
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
        <div class="w-full max-w-md p-8 space-y-5 bg-slate-700 rounded-xl shadow-2xl shadow-slate-900">
            <div class="space-y-2">
                <h2 class="text-2xl font-bold text-center">Üdv újra!</h2>
                <h3 class="text-center">Add meg adataid a bejelentkezéshez</h3>
            </div>
            <form @submit.prevent="signIn" class="space-y-5">
                <div class="space-y-3">
                    <div class="border border-slate-500 rounded-md focus-within:border-slate-300 duration-300">
                        <label for="email" class="sr-only">Email cím</label>
                        <input v-model="email" id="email" name="email" type="email" autocomplete="email" class="w-full p-3 outline-none rounded-md focus:z-10 sm:text-sm" placeholder="Email cím">
                    </div>
                    <div class="border border-slate-500 rounded-md focus-within:border-slate-300 duration-300">
                        <label for="password" class="sr-only">Jelszó</label>
                        <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" class="w-full p-3 outline-none rounded-md focus:z-10 sm:text-sm" placeholder="Jelszó">
                    </div>
                </div>
                <div>
                    <button type="submit" class="relative flex justify-center w-full p-3 text-sm font-medium bg-gradient-to-t from-primary-600 to-primary-500 rounded-md hover:to-primary-400 duration-300">
                        Bejelentkezés
                    </button>
                </div>
            </form>
            <div>
                <p class="text-sm text-center">Még nincs fiókod? <NuxtLink to="/register"><span class="text-primary-500">Regisztrálj</span></NuxtLink>
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