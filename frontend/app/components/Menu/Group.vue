<script setup lang="ts">
import type { MenuGroup } from '~/types/Menu';

const props = defineProps<{
    group: MenuGroup
}>();

</script>

<template>
    <div class="flex flex-col gap-2.5">
        <span class="pl-3 text-sm text-gray-400">{{ props.group.title }}</span>
        <MenuItem v-for="item in props.group.items" :key="item.title" :item="item" :active-style="group.activeStyle ?? true"/>
    </div>
</template>


<style scoped>

</style>