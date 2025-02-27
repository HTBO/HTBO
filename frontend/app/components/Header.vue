<script setup lang="ts">

</script>

<template>
    <header class="bg-slate-900 text-white">
        <div class="container mx-auto py-4">
            <div class="flex justify-between items-center">
                <div>
                    <NuxtLink to="/" class="text-2xl font-bold">HTBO</NuxtLink>
                </div>
                <div class="space-x-4">
                    <NuxtLink to="/login" class="text-lg p-2 border border-slate-600 hover:bg-slate-500 rounded-xl duration-300">Bejelentkezés</NuxtLink>
                    <NuxtLink to="/register" class="text-lg p-2 bg-slate-600 hover:bg-slate-500 rounded-xl duration-300">Regisztráció</NuxtLink>
                </div>
            </div>
        </div>
    </header>
</template>


<style scoped>

</style>