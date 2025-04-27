<script setup lang="ts">
import type { Tab } from '~/types/Tab';

const props = defineProps<{
    tabs: Tab[]
}>()

const emit = defineEmits<{
    (e: 'update:activeTab', value: Tab): void
}>()

const activeTab = ref<Tab | null>(props.tabs[0] ?? null);
const underline = ref({ width: 0, left: 0 });

const setActiveTab = (newTab: Tab) => {
    activeTab.value = newTab;
    emit('update:activeTab', newTab);
}

const updateUnderline = () => {
    nextTick(() => {
        const activeTabElement = document.querySelector('.active-tab') as HTMLElement;
        const navElement = document.querySelector('.tab-nav') as HTMLElement;
        if (activeTabElement && navElement) {
            const activeRect = activeTabElement.getBoundingClientRect();
            const navRect = navElement.getBoundingClientRect();
            underline.value = {
                width: activeRect.width,
                left: activeRect.left - navRect.left,
            };
        } else {
            underline.value = { width: 0, left: 0 };
        }
    });
};

watch(activeTab, updateUnderline);
onMounted(() => {
    updateUnderline();
});

</script>

<template>
    <nav ref="tabNavigation" class="tab-nav relative flex py-2 gap-2 border-b border-gray-700">
        <div v-if="activeTab" class="absolute inset-x-0 -bottom-0.5 h-1 bg-primary-600 rounded-lg duration-300" :style="{ left: `${underline.left}px`, width: `${underline.width}px` }"></div>
        <button v-for="tab in tabs"
            :key="tab.name"
            @click="setActiveTab(tab)"
            @keydown.enter="setActiveTab(tab)"
            class="py-2 px-5 rounded-lg hover:bg-gray-700/50 duration-100"
            :class="activeTab?.name === tab.name ? 'active-tab text-gray-200' : 'text-gray-400'"
            :aria-selected="activeTab?.name === tab.name"
            role="tab">
            <p class="font-semibold group-hover:text-white duration-300">{{ tab.name }}</p>
        </button>
    </nav>
</template>

<style scoped>

</style>