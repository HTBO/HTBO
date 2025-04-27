<script setup lang="ts">
import { menu } from '~/constants/Menu'

</script>

<template>
    <div class="max-lg:hidden sticky top-0 left-0 w-64 h-screen flex flex-col justify-between p-6 bg-surface-900">
        <div class="flex flex-col gap-10">
            <span class="text-xl font-bold">HTBO</span>
            <MenuGroup v-for="group in menu" :key="group.title" :group="group"/>
        </div>
        <MenuGetApp/>
    </div>
</template>


<style scoped>
</style>