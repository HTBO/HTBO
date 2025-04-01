<script setup lang="ts">
import type { MenuItem } from '~/types/Menu';

const props = defineProps<{
    item: MenuItem
}>();

</script>

<template>
    <NuxtLink :to="item.link" class="flex items-center gap-3 px-3 py-2">
        <Icon :name="`icons:${item.icon}`" size="1.25rem" class="text-gray-400"/>
        <span class="font-medium">{{ item.title }}</span>
    </NuxtLink>
</template>


<style scoped>

</style>