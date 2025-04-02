<script setup lang="ts">

</script>

<template>
    <div class="relative flex h-full">
        <MenuSidebar/>
        <div class="w-full px-10 py-5 space-y-5">
            <Header/>
            <slot/>
        </div>
    </div>
</template>

<style scoped>

</style>