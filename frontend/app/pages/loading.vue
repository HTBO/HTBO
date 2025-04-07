<script setup lang="ts">
definePageMeta({
    layout: 'blank'
});

const authStore = useAuthStore();
const router = useRouter();

// Redirect when auth is initialized
const redirectPath = computed(() => {
    if (authStore.initialized) {
       router.push(authStore.isAuthenticated ? '/dashboard' : '/login');
    }
    return null;
});
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-surface-950">
        <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xl text-gray-400">Loading...</p>
        </div>
    </div>
</template>