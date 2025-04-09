<script setup lang="ts">
interface SearchEvent {
  value: string;
  path: string;
}

// Add type declaration for Nuxt app
declare module '#app' {
  interface NuxtApp {
    $emit(event: 'search', payload: SearchEvent): void;
  }
}

const route = useRoute();
const searchValue = ref('');
const nuxtApp = useNuxtApp();

const showSearch = computed(() => {
  return !route.path.includes('/dashboard/users/') && 
         !route.path.includes('/dashboard/sessions/create');
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
    <header class="flex justify-between">
        <div class="grow max-w-xl">
          <HeaderSearch v-if="showSearch" v-model:searchValue="searchValue" :placeholder="searchPlaceholder" />
        </div>
        <HeaderUser />
    </header>
</template>

<style scoped></style>