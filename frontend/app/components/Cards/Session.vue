<script setup lang="ts">
import type { Session } from '~/types/Session';

const props = defineProps<{
    session: Session;
}>();
</script>

<template>
    <div>
        {{ session._id }}
    </div>
</template>

<style scoped>

</style>