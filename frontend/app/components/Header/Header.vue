<script setup lang="ts">
interface SearchEvent {
  value: string;
  path: string;
}

declare module '#app' {
  interface NuxtApp {
    $emit(event: 'search', payload: SearchEvent): void;
  }
}

const route = useRoute();
const searchValue = ref('');
const nuxtApp = useNuxtApp();
const { user } = useAuthStore();

const showSearch = computed(() => {
  return !route.path.includes('/dashboard/users/') &&
    !route.path.includes('/dashboard/sessions/create') &&
    !route.path.includes('/dashboard/sessions/') &&
    !route.path.includes('/dashboard/groups/create') &&
    !route.path.includes('/dashboard/groups/') &&
    route.path !== '/dashboard';
});

const searchPlaceholder = computed(() => {
  switch (route.path) {
    case '/dashboard/friends':
      return 'Search friends...';
    case '/dashboard/friends/add':
      return 'Find new friends...';
    case '/dashboard/sessions':
      return 'Search sessions...';
    case '/dashboard/groups':
      return 'Search groups...';
    default:
      return 'Search...';
  }
});

watch(searchValue, (newValue) => {
  const searchEvent: SearchEvent = {
    value: newValue,
    path: route.path
  };
  nuxtApp.$emit('search', searchEvent);
});
</script>

<template>
  <header class="flex justify-between gap-5">
    <div class="grow max-w-xl flex items-center">
      <HeaderSearch v-if="showSearch" v-model:searchValue="searchValue" :placeholder="searchPlaceholder" />
      <span v-else-if="route.path === '/dashboard'" class="text-2xl font-medium">Welcome, {{ user?.username }}!</span>
    </div>
    <HeaderUser />
  </header>
</template>

<style scoped></style>