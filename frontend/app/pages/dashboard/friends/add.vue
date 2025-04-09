<script setup lang="ts">
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const users = ref<User[]>([]);
const filteredUsers = ref<User[]>([]);
const isLoading = ref(false);
const searchValue = useState<string>('searchValue', () => '');

const refreshUserList = async () => {
    isLoading.value = true;
    try {
        const response = await useUserApi().getAllUsers();
        const { isMe, isFriend } = useUserStatus();
        const currentUser = useAuthStore().user;
        users.value = response.filter(user => !isMe(user, currentUser) && !isFriend(user, currentUser));
        filteredUsers.value = users.value;
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(refreshUserList);

watch(searchValue, (newValue) => {
    if (newValue) {
        filteredUsers.value = users.value.filter(user => user.username.toLowerCase().includes(newValue.toLowerCase()));
    } else {
        filteredUsers.value = users.value;
    }
});

provide('refreshUsers', refreshUserList);
</script>

<template>
    <div>
        <h2 class="text-2xl">Search Results</h2>
        <Loading v-if="isLoading"/>
        <Transition name="fade">
            <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                <CardsFriend v-for="user in filteredUsers" :key="user._id" :friend="user" />
            </div>
        </Transition>
    </div>
</template>

<style scoped>

</style>