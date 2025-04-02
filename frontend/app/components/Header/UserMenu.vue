<script setup lang="ts">
import UserMenuItem from './UserMenuItem.vue';

const props = defineProps<{
    avatarUrl: string;
    username: string;
    email: string;
}>();

const isMenuOpen = inject('isUserMenuOpen') as Ref<boolean>;

const menuItems = [
    {
        name: 'Settings',
        icon: 'settings',
        link: '/dashboard/settings'
    },
    {
        name: 'Logout',
        icon: 'logout',
        iconColor: 'text-red-500',
        action: () => {
            useUserApi().logout()
        }
    }
]

const handleClickOutside = (event: MouseEvent) => {
    const menu = document.querySelector('.user-menu') as HTMLElement;
    if (menu && !menu.contains(event.target as Node)) {
        isMenuOpen.value = false;
    }
}

watch(isMenuOpen, (newValue) => {
    if (newValue) {
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    } else {
        document.removeEventListener('click', handleClickOutside);
    }
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="user-menu absolute z-10 right-0 top-12 w-[20rem] flex flex-col gap-2 p-3 bg-surface-900 rounded-xl duration-200" :class="[isMenuOpen ? 'opacity-100' : 'opacity-0 -translate-y-5 scale-95 pointer-events-none']">
        <div class="flex items-center gap-4 p-3 bg-gray-900/70 rounded-xl duration-300">
            <NuxtLink :to="`/dashboard/users/${username}`" class="group size-16 border-2 border-primary-600 rounded-full">
                <NuxtImg :src="avatarUrl" alt="User Avatar" class="group-hover:opacity-70 rounded-full duration-300" />
            </NuxtLink>
            <div class="flex flex-col gap-0.5">
                <span class="text-xl font-semibold">{{ username }}</span>
                <p class="text-sm text-gray-500 text-nowrap">{{ email }}</p>
            </div>
        </div>
        <UserMenuItem v-for="item in menuItems" :item="item"/>
    </div>
</template>

<style scoped>

</style>