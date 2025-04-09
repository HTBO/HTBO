<script setup lang="ts">

useSeoMeta({
  title: 'HTBO',
})
</script>

<template>
  <UApp>
    <div class="min-h-screen h-screen bg-surface-950 text-white overflow-x-hidden">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>