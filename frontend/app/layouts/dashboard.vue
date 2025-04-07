<script setup lang="ts">

</script>

<template>
    <div class="relative flex h-full">
        <MenuSidebar/>
        <div class="w-full flex flex-col px-10 py-5 space-y-5">
            <Header/>
            <div class="grow">
                <slot/>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>