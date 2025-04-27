<script setup lang="ts">
import type { Session } from '~/types/Session';

const props = defineProps<{
    session: Session;
}>();

const router = useRouter();

const authStore = useAuthStore();
const { confirmSession, rejectSession, deleteSession } = useSessionApi();
const { getUserSessionStatus, getSessionTimeTag, getFormattedDate, getAcceptedParticipantsCount } = useSessionUtils();

const refreshSessions = inject('refreshSessions') as (() => Promise<void>) || (() => Promise.resolve());

const userStatus = computed(() => getUserSessionStatus(props.session));
const timeTag = computed(() => getSessionTimeTag(props.session));
const acceptedParticipantsCount = computed(() => getAcceptedParticipantsCount(props.session));

const handleSessionAction = async (action: 'accept' | 'reject' | 'leave') => {
    if (action === 'accept') {
        await confirmSession({ sessionId: props.session.id, userId: authStore.user?._id || '' });
    } else if (action === 'reject' || action === 'leave') {
        await rejectSession({ sessionId: props.session.id, userId: authStore.user?._id || '' }, action);
    }
    await refreshSessions();
};

const endSession = async () => {
    await deleteSession(props.session.id);
    await refreshSessions();
};

const handleRoute = () => {
    router.push(`/dashboard/sessions/${props.session.id}`);
};
</script>

<template>
    <div @click="handleRoute" class="flex flex-col p-5 bg-surface-900 hover:bg-surface-900/80 border-2 border-transparent hover:border-primary-600 rounded-2xl duration-300 cursor-pointer">
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <NuxtImg :src="`https:${session.game?.cover}`" width="5rem" class="w-20 h-28 rounded-lg object-cover" />
                <div class="grow flex flex-col justify-between overflow-hidden">
                    <div class="flex flex-col gap-1">
                        <div class="flex gap-2 justify-between items-start">
                            <h2 class="text-xl font-semibold text-surface-50">{{ session.game?.name }}</h2>
                            <span class="flex-none flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap" :class="timeTag.color">
                                <Icon name="octicon:dot-fill-16" size="0.6rem" />
                                {{ timeTag.tag }}
                            </span>
                        </div>
                        <div class="flex flex-col text-sm">
                            <span class="text-gray-400">Hosted By</span>
                            <span>{{ session.host?.username }}</span>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex items-center">
                            <Icon name="ion:time-outline" size="1rem" class="text-primary-500" />
                            <span class="text-sm text-gray-400 ml-1">{{ getFormattedDate(session.scheduledAt) }}</span>
                        </div>
                        <div v-if="session.participants.length !== 0" class="flex items-center">
                            <Icon name="icons:person" size="1rem" class="text-primary-500" />
                            <span class="text-sm text-gray-400 ml-1">{{ acceptedParticipantsCount + 1 }}/{{ session.participants.length + 1 }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button @click.stop="endSession" v-if="userStatus === 'host'" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    End Session
                </button>
                <div v-else-if="userStatus === 'pending'" class="flex gap-2">
                    <button @click.stop="handleSessionAction('reject')" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                        Decline
                    </button>
                    <button @click.stop="handleSessionAction('accept')" class="w-full py-2 bg-primary-600 hover:bg-primary-700 rounded-xl duration-300">
                        Join Session
                    </button>
                </div>
                <button @click.stop="handleSessionAction('leave')" v-else-if="userStatus === 'accepted'" class="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    Leave Session
                </button>
            </div>
        </div>
    </div>
</template>