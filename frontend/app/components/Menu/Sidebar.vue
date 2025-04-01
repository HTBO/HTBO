<script setup lang="ts">
import { menu } from '~/constants/menu'


</script>

<template>
    <div class="w-64 h-full flex flex-col justify-between p-6 bg-surface-900">
        <div class="flex flex-col gap-10">
            <span class="text-xl font-bold">HTBO</span>
            <MenuGroup v-for="group in menu" :key="group.title" :group="group"/>
        </div>
        <div>
            <MenuUser/>
        </div>
    </div>
</template>


<style scoped>

</style>