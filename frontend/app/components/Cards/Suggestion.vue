<script setup lang="ts">
defineProps({
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    linkTo: {
        type: String,
        required: true
    },
    linkText: {
        type: String,
        default: 'Get started'
    }
});
</script>

<template>
    <div class="group flex flex-col justify-between bg-surface-800/50 rounded-xl p-6 border-2 border-transparent hover:border-primary-600 transition duration-300 ease-in-out">
        <div>
            <div class="flex items-center justify-center h-16 w-16 bg-gradient-to-tr from-primary-800 to-primary-700 rounded-full mb-4">
                <Icon :name="icon" size="1.75rem" class="text-gray-200 group-hover:scale-110 duration-300"/>
            </div>
            <h3 class="text-lg font-medium mb-2">{{ title }}</h3>
            <p class="text-gray-400 mb-4">{{ description }}</p>
        </div>
        <div class="flex">
            <NuxtLink :to="linkTo" class="text-primary-500 hover:text-primary-400 flex items-center duration-300">
                {{ linkText }}
                <Icon name="material-symbols:arrow-forward" class="ml-1" />
            </NuxtLink>
        </div>
    </div>
</template>