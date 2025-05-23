<script setup lang="ts">
const props = defineProps<{
    item: {
        icon: string
        iconColor?: string
        name: string
        link?: string
        action?: () => void
    }
}>()

const clickHandler = () => {
    if (props.item.link) {
        useRouter().push(props.item.link)
    } else if (props.item.action) {
        props.item.action()
    }
}

const iconClass = computed(() => {
    if (props.item.iconColor === 'text-red-500') {
        return `text-red-500/80 group-hover:text-red-500`
    }
    return 'text-gray-400 group-hover:text-white'
})
</script>

<template>
    <button @click="clickHandler" class="group flex items-center gap-4 px-4 py-3 hover:bg-gray-700/50 rounded-xl duration-300">
        <div class="flex items-center justify-center duration-300" :class="iconClass">
            <Icon :name="`icons:${item.icon}`" size="1.5rem" />
        </div>
        <span class="font-semibold text-gray-400 group-hover:text-white duration-300">{{ item.name }}</span>
    </button>
</template>

<style scoped>

</style>