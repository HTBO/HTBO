<script setup lang="ts">

const router = useRouter();

onMounted(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }
});
</script>

<template>
    <div>

    </div>
</template>

<style scoped></style>