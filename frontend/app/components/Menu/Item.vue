<script setup lang="ts">
import type { MenuItem } from '~/types/Menu';

const props = defineProps<{
    item: MenuItem
}>();

</script>

<template>
    <NuxtLink :to="item.link" class="group flex items-center gap-3 px-3 py-2 hover:bg-gray-600 text-gray-400 hover:text-gray-100 rounded-xl duration-300">
        <Icon :name="`icons:${item.icon}`" size="1.25rem"/>
        <span class="font-medium">{{ item.title }}</span>
    </NuxtLink>
</template>


<style scoped>

</style>