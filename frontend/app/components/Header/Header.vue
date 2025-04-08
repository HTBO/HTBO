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
        <HeaderSearch v-model:searchValue="searchValue" :placeholder="searchPlaceholder" />
        <HeaderUser />
    </header>
</template>

<style scoped></style>