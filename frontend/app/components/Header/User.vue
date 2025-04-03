<script setup lang="ts">
const user = useAuthStore().user;

const isUserMenuOpen = ref(false);
const toggleMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
};

provide('isUserMenuOpen', isUserMenuOpen);

onMounted(() => {
    console.log(user?.avatarUrl)
})
</script>

<template>
    <div class="relative">
        <button @click="toggleMenu" class="group size-10 border-2 border-primary-600 rounded-full cursor-pointer">
            <ClientOnly>
                <NuxtImg :src="user?.avatarUrl" class="group-hover:opacity-75 rounded-full duration-300" />
            </ClientOnly>
        </button>
        <HeaderUserMenu :avatar-url="user?.avatarUrl!" :username="user?.username!" :email="user?.email!"/>
    </div>
</template>

<style scoped>

</style>