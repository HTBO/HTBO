<script setup lang="ts">
import type { User } from '~/types/User';

const props = defineProps<{
    user: User;
}>();

const friends = ref<User[]>([]);

onMounted(async () => {
    const friendResponses = await Promise.all(props.user.friends.map(async friend => {
        if(typeof friend.userId === 'string') {
            return useUserApi().getUserById(friend.userId);
        }
        return null;
    }));
    friends.value = friendResponses.filter((friend): friend is User => friend !== null);
});
</script>

<template>
    <Transition name="fade">
        <div v-if="friends.length > 0" class="grid grid-cols-4 gap-4">
            <CardsFriend v-for="friend in friends" :key="friend?._id" :friend="friend"/>
        </div>
    </Transition>
</template>