<script setup lang="ts">
import type { Session } from '~/types/Session';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute();
const authStore = useAuthStore();
const { id } = route.params;

const { confirmSession, rejectSession, deleteSession } = useSessionApi();
const { getUserSessionStatus, getSessionTimeTag, getFormattedDate, getAcceptedParticipantsCount, loadSession } = useSessionUtils();

const session = ref<Session | null>(null);
const isLoading = ref(true);

const userStatus = computed(() => getUserSessionStatus(session.value));
const timeTag = computed(() => getSessionTimeTag(session.value));
const acceptedParticipantsCount = computed(() => getAcceptedParticipantsCount(session.value));

const fetchSession = async () => {
    isLoading.value = true;
    try {
        const enrichedSession = await loadSession(id as string, {
            loadParticipantDetails: true,
            redirectOnError: true
        });
        
        if (enrichedSession) {
            session.value = enrichedSession;
        }
    } finally {
        isLoading.value = false;
    }
};

const handleSessionAction = async (action: 'accept' | 'reject' | 'leave') => {
    if(!session.value?.id) return;

    if(action === 'accept') {
        await confirmSession({ sessionId: session.value?.id, userId: authStore.user?._id || '' });
    } else if(action === 'reject' || action === 'leave') {
        await rejectSession({ sessionId: session.value?.id, userId: authStore.user?._id || '' }, action);
    }
    await fetchSession();
};

const handleEndSession = async () => {
    if(!session.value?.id) return;
    await deleteSession(session.value.id);
};

onMounted(fetchSession);
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else-if="session" class="space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <NuxtLink to="/dashboard/sessions" class="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                    <Icon name="material-symbols:arrow-back" size="1.5rem" />
                </NuxtLink>
                <h1 class="text-2xl font-bold">Session Details</h1>
            </div>
            
            <div>
                <div v-if="userStatus === 'pending'" class="flex gap-3">
                    <button @click="handleSessionAction('reject')" class="px-5 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                        Decline
                    </button>
                    <button @click="handleSessionAction('accept')" class="px-5 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl duration-300">
                        Join Session
                    </button>
                </div>
                <button v-else-if="userStatus === 'accepted'" @click="handleSessionAction('leave')" class="px-5 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    Leave Session
                </button>
                <button v-else-if="userStatus === 'host'" @click="handleEndSession" class="px-5 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400/80 hover:text-red-200 rounded-xl duration-300">
                    End Session
                </button>
            </div>
        </div>

        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600/30 to-surface-800 p-6">
            <div class="absolute top-4 right-4">
                <span class="flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap" :class="timeTag.color">
                    <Icon name="octicon:dot-fill-16" size="0.6rem"/>
                    {{ timeTag.tag }}
                </span>
            </div>
            
            <div class="flex items-center gap-4 mt-4">
                <div class="w-24 h-32 rounded-lg overflow-hidden shadow-lg">
                    <img v-if="session.game?.cover" :src="`https:${session.game.cover}`" :alt="session.game?.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full bg-surface-950 flex items-center justify-center">
                        <Icon name="material-symbols:videogame-asset" size="2rem" class="text-gray-400" />
                    </div>
                </div>
                
                <div class="flex flex-col">
                    <h2 class="text-2xl font-bold mb-2">{{ session.game?.name || 'Unknown Game' }}</h2>
                    <p class="text-gray-400">{{ session.description }}</p>
                </div>
            </div>
        </div>

        <div class="bg-surface-800/70 p-6 rounded-2xl">
            <h3 class="text-gray-400 text-sm mb-3">Host</h3>
            <div class="flex items-center gap-4">
                <div class="size-12 bg-surface-600 rounded-full flex items-center justify-center overflow-hidden">
                    <img v-if="session.host?.avatarUrl" :src="session.host.avatarUrl" :alt="session.host?.username" class="w-full h-full object-cover" />
                    <Icon v-else name="material-symbols:person" size="1.5rem" class="text-gray-300" />
                </div>
                <div>
                    <NuxtLink 
                        :to="`/dashboard/users/${session.host?.username}`" 
                        class="text-lg font-medium hover:text-primary-500 transition-colors"
                    >
                        {{ session.host?.username || 'Unknown User' }}
                    </NuxtLink>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-surface-800/70 p-6 rounded-2xl">
                <h3 class="text-xl font-semibold mb-4">Session Details</h3>
                <div class="space-y-4">
                    <div>
                        <h4 class="text-gray-400 text-sm">Scheduled Time</h4>
                        <p class="text-lg">{{ session.scheduledAt ? getFormattedDate(session.scheduledAt) : 'Not scheduled' }}</p>
                    </div>
                    
                    <div>
                        <h4 class="text-gray-400 text-sm">Participants</h4>
                        <p class="text-lg">{{ acceptedParticipantsCount }}/{{ session.participants.length }} members joined</p>
                    </div>
                    
                    <div>
                        <h4 class="text-gray-400 text-sm">Your Status</h4>
                        <p class="text-lg">
                            <span v-if="userStatus === 'host'" class="text-primary-500">Host</span>
                            <span v-else-if="userStatus === 'accepted'" class="text-green-500">Joined</span>
                            <span v-else-if="userStatus === 'pending'" class="text-yellow-500">Invited</span>
                            <span v-else class="text-gray-400">Not a member</span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-surface-800/70 p-6 rounded-2xl">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Members</h3>
                    <button class="text-sm text-primary-500 hover:text-primary-400">View All</button>
                </div>
                
                <ul class="space-y-4">
                    <li class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center overflow-hidden">
                                <img v-if="session.host?.avatarUrl" :src="session.host.avatarUrl" :alt="session.host?.username" class="w-full h-full object-cover" />
                                <Icon v-else name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                            </div>
                            <div>
                                <NuxtLink 
                                    :to="`/dashboard/users/${session.host?.username}`" 
                                    class="hover:text-primary-500 transition-colors"
                                >
                                    {{ session.host?.username || 'Unknown User' }}
                                </NuxtLink>
                                <p class="text-xs text-primary-500">Host</p>
                            </div>
                        </div>
                    </li>
                    
                   
                    <li v-for="participant in session.participants.slice(0, 3)" :key="participant.userData?._id" class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center overflow-hidden">
                                <img 
                                    v-if="participant.userData?.avatarUrl" 
                                    :src="participant.userData?.avatarUrl" 
                                    :alt="participant.userData?.username" 
                                    class="w-full h-full object-cover" 
                                />
                                <Icon v-else name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                            </div>
                            <div>
                                <NuxtLink 
                                    :to="`/dashboard/users/${participant.userData?.username}`" 
                                    class="hover:text-primary-500 transition-colors"
                                >
                                    {{ participant.userData?.username || 'Unknown User' }}
                                </NuxtLink>
                                <p class="text-xs" :class="{
                                    'text-green-500': participant.sessionStatus === 'accepted',
                                    'text-yellow-500': participant.sessionStatus === 'pending'
                                }">
                                    {{ participant.sessionStatus === 'accepted' ? 'Joined' : 'Pending' }}
                                </p>
                            </div>
                        </div>
                    </li>
                    
                    <li v-if="session.participants.length > 3" class="text-center text-sm text-gray-400">
                        + {{ session.participants.length - 3 }} more members
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>