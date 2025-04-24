<script setup lang="ts">
import type { Session } from '~/types/Session';
import { sessionsTabs } from '~/constants/Tab';
import type { Tab } from '~/types/Tab';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const authStore = useAuthStore();
const sessions = ref<Session[]>([]);
const filteredSessions = ref<Session[]>([]);
const isLoading = ref(true);
const searchValue = useState<string>('sessionSearchValue', () => '');

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

const loadSessions = async () => {
    isLoading.value = true;
    try {
        if (!authStore.user) return;
        
        const { getSessionById } = useSessionApi();
        const { getGameById } = useGameApi();
        
        const sessionResponses = await Promise.all(
            authStore.user?.sessions.map(session => getSessionById(session.sessionId))
        );
        
        const sessionsWithGames = await Promise.all(
            sessionResponses.map(async (session) => {
                if (session && session.gameId) {
                    try {
                        const gameInfo = await getGameById(session.gameId.toString());
                        console.log(`Game info for session ${session.id}:`, gameInfo);
                        return {
                            ...session,
                            game: gameInfo,
                        };
                    } catch (error) {
                        console.error(`Error fetching game for session ${session.id}:`, error);
                        return session;
                    }
                }
                return session;
            })
        );
        
        sessions.value = sessionsWithGames || [];
        console.log('Sessions loaded:', sessions.value);
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

onMounted(loadSessions);

provide('refreshSessions', loadSessions);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Sessions</h1>
            <NuxtLink 
                to="/dashboard/sessions/create" 
                class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
            >
                <Icon name="icons:add" size="1.25rem" />
                <span>Create Session</span>
            </NuxtLink>
        </div>
        
        <TabNavigation :tabs="sessionsTabs" @update:active-tab="activeTab = $event" />

        <SectionsSessions 
            :sessions="displayedSessions"
            :is-loading="isLoading"
            :empty-message="emptyMessage"
            :show-create-session-link="sessions.length === 0 && activeTab?.name === 'All Sessions'"
        />
    </div>
</template>