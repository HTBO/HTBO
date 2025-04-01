<script setup lang="ts">
import type { MenuItem } from '~/types/Menu';

const props = defineProps<{
    item: MenuItem,
    activeStyle: boolean
}>();

const route = useRoute();
console.log(props.activeStyle)

const checkActive = (link: string) => {
    if(!props.activeStyle) return false;
    if(link === '/dashboard'){
        return route.name === 'dashboard'
    }
    const currentPath = route.path;
    return currentPath === link || currentPath.startsWith(link + '/');
};
</script>

<template>
    <NuxtLink :to="item.link" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-600 hover:text-gray-100 rounded-xl duration-300"
        :class="checkActive(item.link) ? 'bg-gray-600 text-gray-100' : 'text-gray-400'">
        <Icon :name="`icons:${item.icon}`" size="1.25rem"/>
        <span class="font-medium">{{ item.title }}</span>
    </NuxtLink>
</template>


<style scoped>

</style>