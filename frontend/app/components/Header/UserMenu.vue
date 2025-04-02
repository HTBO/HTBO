<script setup lang="ts">
defineProps<{
    avatarUrl: string
    username: string
}>()
</script>

<template>
    <div class="absolute right-0 w-56 h-40 flex flex-col m-5 p-3 bg-surface-800 rounded-xl">
        <NuxtLink :to="''" class="flex items-center gap-2 p-2 hover:bg-gray-600 cursor-pointer rounded-md duration-300">
            <div class="size-8 border-2 border-primary-600 rounded-full">
                <NuxtImg :src="avatarUrl" alt="User Avatar" class="rounded-full duration-300" />
            </div>
            <span class="font-semibold">{{ username }}</span>
        </NuxtLink>
    </div>
</template>

<style scoped>

</style>