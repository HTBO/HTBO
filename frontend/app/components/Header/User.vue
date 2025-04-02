<script setup lang="ts">
const user = useAuthStore().user;
</script>

<template>
    <div class="realtive">
        <div class="group size-10 border-2 border-primary-600 rounded-full cursor-pointer">
            <NuxtImg :src="user?.avatarUrl" alt="User Avatar" class="group-hover:opacity-75 rounded-full duration-300" />
        </div>
        <HeaderUserMenu :avatar-url="user?.avatarUrl!" :username="user?.username!"/>
    </div>
</template>

<style scoped>

</style>