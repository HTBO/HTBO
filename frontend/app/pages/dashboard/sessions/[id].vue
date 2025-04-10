<script setup lang="ts">
import type { Session } from '~/types/Session';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const route = useRoute();
const router = useRouter();
const { id } = route.params;
const authStore = useAuthStore();
const toast = useToast();
const { getSessionById } = useSessionApi();

const isLoading = ref(true);
const session = ref<Session | null>(null);
const isOwner = ref(false);
const membershipStatus = ref('none');

const loadSession = async () => {
    isLoading.value = true;
    try {
        const sessionResponse = await getSessionById(id as string);
        
        session.value = sessionResponse;
        
        // Check if current user is the host
        if (session.value && authStore.user) {
            isOwner.value = session.value.hostId === authStore.user._id;
            
            // Check user's participation status
            const participation = session.value.participants.find(
                p => typeof p.user === 'string' 
                    ? p.user === authStore.user?._id 
                    : p.user._id === authStore.user?._id
            );
            
            membershipStatus.value = participation ? participation.status : 'none';
        }
    } catch (error) {
        console.error('Error loading session:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load session details',
            color: 'error'
        });
        router.push('/dashboard/sessions');
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
};

onMounted(loadSession);
</script>

<template>
    <Loading v-if="isLoading" />
    <div v-else-if="session" class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
                <NuxtLink
                    to="/dashboard/sessions"
                    class="flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                    <Icon name="material-symbols:arrow-back" size="1.5rem" />
                </NuxtLink>
                <h1 class="text-2xl font-bold">Session Details</h1>
            </div>
            
            <div class="flex gap-3">
                <button 
                    v-if="isOwner"
                    class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:delete" size="1.25rem" />
                    <span>Delete Session</span>
                </button>
                
                <button 
                    v-if="isOwner"
                    class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:edit" size="1.25rem" />
                    <span>Edit Session</span>
                </button>
                
                <button 
                    v-if="!isOwner && membershipStatus === 'none'"
                    class="flex items-center gap-2 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:add" size="1.25rem" />
                    <span>Join Session</span>
                </button>
                
                <button 
                    v-if="!isOwner && membershipStatus === 'pending'"
                    class="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 font-semibold py-2 px-4 rounded-lg duration-300"
                    disabled
                >
                    <Icon name="material-symbols:pending" size="1.25rem" />
                    <span>Request Pending</span>
                </button>
                
                <button 
                    v-if="!isOwner && (membershipStatus === 'accepted' || membershipStatus === 'host')"
                    class="flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg duration-300"
                >
                    <Icon name="material-symbols:logout" size="1.25rem" />
                    <span>Leave Session</span>
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
                <div class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Session Information</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-gray-400 text-sm">Host</h3>
                            <p class="text-lg">{{ typeof session.hostId === 'string' ? session.hostId : session.hostId }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Game</h3>
                            <p class="text-lg">{{ session.gameId }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Scheduled At</h3>
                            <p class="text-lg">{{ formatDate(session.schduledAt) }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Description</h3>
                            <p class="text-lg">{{ session.description }}</p>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm">Status</h3>
                            <div class="flex items-center mt-1">
                                <span v-if="isOwner" class="text-primary-500 font-medium">Host</span>
                                <span v-else-if="membershipStatus === 'accepted'" class="text-green-500 font-medium">
                                    Participating
                                </span>
                                <span v-else-if="membershipStatus === 'pending'" class="text-yellow-500 font-medium">
                                    Request Pending
                                </span>
                                <span v-else-if="membershipStatus === 'rejected'" class="text-red-500 font-medium">
                                    Rejected
                                </span>
                                <span v-else class="text-gray-400 font-medium">Not Participating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                <div class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Participants</h2>
                    <div class="space-y-2">
                        <div v-if="session.participants.length === 0" class="text-gray-400">
                            No participants yet
                        </div>
                        
                        <div v-for="participant in session.participants" :key="typeof participant.user === 'string' ? participant.user : participant.user._id" class="flex justify-between items-center p-2 bg-surface-700/50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center">
                                    <Icon name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                                </div>
                                <span>{{ typeof participant.user === 'string' ? participant.user : participant.user.username }}</span>
                            </div>
                            <span 
                                :class="{
                                    'text-green-500': participant.status === 'accepted',
                                    'text-yellow-500': participant.status === 'pending',
                                    'text-red-500': participant.status === 'rejected',
                                    'text-primary-500': participant.status === 'host'
                                }"
                                class="text-sm font-medium"
                            >
                                {{ participant.status.charAt(0).toUpperCase() + participant.status.slice(1) }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div v-if="isOwner && session.participants.some(p => p.status === 'pending')" class="bg-surface-800/70 p-6 rounded-2xl">
                    <h2 class="text-xl font-semibold mb-4">Pending Requests</h2>
                    <div class="space-y-2">
                        <div v-for="participant in session.participants.filter(p => p.status === 'pending')" :key="typeof participant.user === 'string' ? participant.user : participant.user._id" class="flex justify-between items-center p-2 bg-surface-700/50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="size-10 bg-surface-600 rounded-full flex items-center justify-center">
                                    <Icon name="material-symbols:person" size="1.25rem" class="text-gray-300" />
                                </div>
                                <span>{{ typeof participant.user === 'string' ? participant.user : participant.user.username }}</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                    <Icon name="material-symbols:check" size="1.25rem" />
                                </button>
                                <button class="p-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                    <Icon name="material-symbols:close" size="1.25rem" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center p-12">
        <Icon name="material-symbols:error" size="3rem" class="text-red-500 mb-4" />
        <h2 class="text-xl font-bold mb-2">Session Not Found</h2>
        <p class="text-gray-400 mb-6">The session you're looking for doesn't exist or has been deleted.</p>
        <NuxtLink to="/dashboard/sessions" class="text-primary-500 hover:text-primary-400 transition-colors">
            Return to Sessions
        </NuxtLink>
    </div>
</template>