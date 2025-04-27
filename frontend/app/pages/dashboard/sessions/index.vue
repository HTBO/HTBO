<script setup lang="ts">
import type { Session } from '~/types/Session';
import { sessionsTabs } from '~/constants/Tab';
import type { Tab } from '~/types/Tab';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const authStore = useAuthStore();
const { loadSessions } = useSessionUtils();

const searchValue = useState<string>('searchValue', () => '');

const sessions = ref<Session[]>([]);
const filteredSessions = ref<Session[]>([]);
const isLoading = ref(true);

const activeTab = ref<Tab | null>(sessionsTabs[0] ?? null);

const emptyMessage = computed(() => {
    if (isLoading.value) return 'Loading sessions...';

    const hasSearch = !!searchValue.value;
    const hasSessions = sessions.value.length > 0;
    const hasFilteredSessions = filteredSessions.value.length > 0;

    switch (activeTab.value?.name) {
        case 'All Sessions':
            return !hasSessions ? 'No sessions available yet' :
                hasSearch && !hasFilteredSessions ? `No sessions match "${searchValue.value}"` :
                    'No sessions to display';

        case 'Hosting':
            return hasSearch && !hasFilteredSessions ? `No hosted sessions match "${searchValue.value}"` :
                'You aren\'t hosting any sessions yet';

        case 'Session Invites':
            return hasSearch && !hasFilteredSessions ? `No invites match "${searchValue.value}"` :
                'You don\'t have any pending session invitations';

        default:
            return 'No sessions to display';
    }
});

const displayedSessions = computed(() => {
    if (!activeTab.value) return filteredSessions.value;

    const userId = authStore.user?._id;

    switch (activeTab.value.name) {
        case 'All Sessions':
            return filteredSessions.value.filter(session =>
                !session.participants.some(participant =>
                    participant.user === userId && participant.sessionStatus === 'pending'
                )
            );

        case 'Hosting':
            return filteredSessions.value.filter(session => session.hostId === userId);

        case 'Session Invites':
            return filteredSessions.value.filter(session =>
                session.participants.some(participant =>
                    participant.user === userId && participant.sessionStatus === 'pending'
                )
            );

        default:
            return filteredSessions.value;
    }
});

const loadAllSessions = async () => {
    isLoading.value = true;
    try {
        if (!authStore.user?.sessions?.length) {
            sessions.value = [];
            filteredSessions.value = [];
            return;
        }

        const sessionIds = authStore.user.sessions.map(session => session.sessionId);
        if( sessionIds.length === 0) {
            sessions.value = [];
            filteredSessions.value = [];
            return;
        }
        sessions.value = await loadSessions(sessionIds);
        filteredSessions.value = sessions.value;
    } catch (error) {
        console.error('Error loading sessions:', error);
    } finally {
        isLoading.value = false;
    }
};

watch(searchValue, (newValue) => {
    if (newValue) {
        filteredSessions.value = sessions.value.filter(session =>
            session.description.toLowerCase().includes(newValue.toLowerCase()) ||
            (session.game?.name && session.game.name.toLowerCase().includes(newValue.toLowerCase())) ||
            session.gameId.toString().toLowerCase().includes(newValue.toLowerCase())
        );
    } else {
        filteredSessions.value = sessions.value;
    }
});

onMounted(loadAllSessions);

provide('refreshSessions', loadAllSessions);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Sessions</h1>
            <NuxtLink to="/dashboard/sessions/create" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300">
                <Icon name="icons:add" size="1.25rem" />
                <span>Create Session</span>
            </NuxtLink>
        </div>

        <TabNavigation :tabs="sessionsTabs" @update:active-tab="activeTab = $event" />

        <SectionsSessions :sessions="displayedSessions" :is-loading="isLoading" :empty-message="emptyMessage" :show-create-session-link="sessions.length === 0 && activeTab?.name === 'All Sessions'" />
    </div>
</template>