<script setup lang="ts">
import type { Session } from '~/types/Session';

const props = defineProps<{
    session: Session;
}>();

const authStore = useAuthStore();
const toast = useToast();
const refreshSessions = inject('refreshSessions') as (() => Promise<void>) || (() => Promise.resolve());
const router = useRouter();
const { getUserSessionStatus, getSessionTimeTag } = useSessionUtils();

const userStatus = computed(() => getUserSessionStatus(props.session));
const timeTag = computed(() => getSessionTimeTag(props.session));

const participantStatus = computed(() => {
    if (userStatus.value === 'host') return 'host';
    
    const participant = props.session.participants.find(
        p => typeof p.user === 'string'
            ? p.user === authStore.user?._id
            : p.user._id === authStore.user?._id
    );

    return participant?.sessionStatus || 'none';
});

const acceptedParticipantsCount = computed(() => {
    return props.session.participants.filter(p => p.sessionStatus === 'accepted').length;
});

const formatDate = (date: string | Date) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Format time as hour:minute
    const timeString = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sessionDate.toDateString() === today.toDateString()) {
        return timeString;
    }
    
    if (sessionDate.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow ${timeString}`;
    }
    
    const month = sessionDate.getMonth() + 1;
    const day = sessionDate.getDate();
    return `${month}.${day} ${timeString}`;
};

const handleSessionAction = async (action: string) => {
    try {
        const { confirmSession, rejectSession } = useSessionApi();
        
        if (action === 'accept') {
            await confirmSession({ sessionId: props.session.id, userId: authStore.user?._id || '' });
        } else if (action === 'decline') {
            await rejectSession({ sessionId: props.session.id, userId: authStore.user?._id || '' });
        }
        
        toast.add({
            title: 'Success',
            description: action === 'accept' ? 'Session joined' : 'Request declined',
            color: 'success'
        });
        await refreshSessions();
    } catch (error) {
        console.error('Error handling session action:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to process your request',
            color: 'error'
        });
    }
};
</script>

<template>
    <div class="flex flex-col p-5 bg-surface-900 rounded-2xl">
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <img :src="session.game?.cover" class="w-20 h-28 rounded-lg object-cover" />
                <div class="grow flex flex-col justify-between overflow-hidden">
                    <div class="flex gap-2 justify-between items-start">
                        <h2 class="text-xl font-semibold text-surface-50">{{ session.game?.name }}</h2>
                        <span class="flex-none flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap" :class="timeTag.color">
                            <Icon name="octicon:dot-fill-16" size="0.6rem"/>
                            {{ timeTag.tag }}
                        </span>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex items-center">
                            <Icon name="ion:time-outline" size="1rem" class="text-primary-500" />
                            <span class="text-sm text-gray-400 ml-1">{{ formatDate(session.scheduledAt) }}</span>
                        </div>
                        <div v-if="session.participants.length === 0" class="flex items-center">
                            <Icon name="icons:person" size="1rem" class="text-primary-500" />
                            <span class="text-sm text-gray-400 ml-1">{{ acceptedParticipantsCount }}/{{ session.participants.length }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button v-if="userStatus === 'host'" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    End Session
                </button>
                <div v-else-if="userStatus === 'pending'" class="flex gap-2">
                    <button @click="handleSessionAction('decline')" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                        Decline
                    </button>
                    <button @click="handleSessionAction('accept')" class="w-full py-2 bg-primary-600 hover:bg-primary-700 rounded-xl duration-300">
                        Join Session
                    </button>
                </div>
                <button v-else-if="userStatus === 'accepted'" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    Leave Session
                </button>
            </div>
        </div>
    </div>
</template>