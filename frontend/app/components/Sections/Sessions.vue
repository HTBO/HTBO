<script setup lang="ts">
import type { Session } from '~/types/Session';
import type { User } from '~/types/User';

const props = defineProps<{
    user: User;
}>();

const sessions = ref<Session[]>([]);

onMounted(async () => {
    // sessions.value = (await Promise.all(props.user.sessions.map(async session => {
    //     if(typeof session.sessionId === 'string') {
    //         return useSessionApi().getSessionById(session.sessionId);
    //     }
    //     return;
    // }))).filter((session): session is Session => session !== undefined);
});
</script>

<template>
    <Transition name="fade">
        <div v-if="sessions.length > 0" class="grid grid-cols-4 gap-4">
            <CardsSession v-for="session in sessions" :key="session?._id" :session="session"/>
        </div>
    </Transition>
</template>