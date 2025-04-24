<script setup lang="ts">
import type { Game } from '~/types/Game';
import type { Group } from '~/types/Group';
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const router = useRouter();
const authStore = useAuthStore();
const { searchGame } = useGameApi();
const { createSession } = useSessionApi();
const toast = useToast();

const description = ref('');
const isLoading = ref(false);

const selectedMembers = ref<string[]>([]);
const availableFriends = ref<User[]>([]);

const selectedGroups = ref<string[]>([]);
const availableGroups = ref<Group[]>([]);

const scheduledTime = ref<Date | null>(null);
const minutes = ref(30);
const customDateTime = ref('');

const gameQuery = ref('');
const isSearching = ref(false);
const searchResults = ref<Game[]>([]);
const selectedGame = ref<Game | null>(null);

const loadUsers = async () => {
    try {
        isLoading.value = true;

        if (!authStore.user?._id) return;

        const friendsStore = useFriendsStore();
        await friendsStore.fetchFriends(authStore.user);

        availableFriends.value = friendsStore.friendsByUser[authStore.user._id]?.friends || [];
    } catch (error) {
        console.error('Error loading friends:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load friends',
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};

const loadGroups = async () => {
    try {
        isLoading.value = true;

        if (!authStore.user?._id) return;

        const groupsStore = useGroupsStore();
        await groupsStore.fetchGroups(authStore.user);

        availableGroups.value = groupsStore.groupsByUser[authStore.user._id]?.groups || [];
    } catch (error) {
        console.error('Error loading groups:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to load groups',
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};

const updateScheduledTime = (selectedMins: number) => {
    minutes.value = selectedMins;
    const now = new Date();
    scheduledTime.value = new Date(now.getTime() + selectedMins * 60000);

    const year = scheduledTime.value.getFullYear();
    const month = String(scheduledTime.value.getMonth() + 1).padStart(2, '0');
    const day = String(scheduledTime.value.getDate()).padStart(2, '0');
    const hours = String(scheduledTime.value.getHours()).padStart(2, '0');
    const mins = String(scheduledTime.value.getMinutes()).padStart(2, '0');
    customDateTime.value = `${year}-${month}-${day}T${hours}:${mins}`;
};

const handleCustomDateTimeChange = () => {
    if (customDateTime.value) {
        scheduledTime.value = new Date(customDateTime.value);

        const now = new Date();
        const diffMs = scheduledTime.value.getTime() - now.getTime();
        minutes.value = Math.round(diffMs / 60000);
    }
};

const searchGames = async (query: string) => {
    if (!query.trim()) {
        searchResults.value = [];
        return;
    }

    try {
        isSearching.value = true;
        const response = await searchGame(query);

        searchResults.value = response || [];
    } catch (error) {
        console.error('Error searching games:', error);
    } finally {
        isSearching.value = false;
    }
};

const debouncedSearch = useDebounce<string>(searchGames, 500);

const selectGame = (game: Game) => {
    selectedGame.value = game;
    gameQuery.value = game.name || '';
    searchResults.value = [];
};

const clearSelectedGame = () => {
    selectedGame.value = null;
    gameQuery.value = '';
};

onMounted(() => {
    loadUsers();
    loadGroups();
    updateScheduledTime(minutes.value);
});

const createNewSession = async () => {
    try {
        if (!description.value.trim()) {
            toast.add({
                title: 'Error',
                description: 'Description is required',
                color: 'error'
            });
            return;
        }

        if (!selectedGame.value) {
            toast.add({
                title: 'Error',
                description: 'Game is required',
                color: 'error'
            });
            return;
        }

        if (!authStore.user?._id) {
            toast.add({
                title: 'Error',
                description: 'You must be logged in to create a session',
                color: 'error'
            });
            return;
        }

        if (!scheduledTime.value) {
            toast.add({
                title: 'Error',
                description: 'Please select a valid date and time',
                color: 'error'
            });
            return;
        }

        isLoading.value = true;

        const sessionData = {
            hostId: authStore.user._id,
            gameId: selectedGame.value.id,
            scheduledAt: scheduledTime.value,
            description: description.value.trim(),
            participants: [
                ...selectedMembers.value.map(userId => ({ user: userId })),
                ...selectedGroups.value.map(groupId => ({ group: groupId }))
            ]
        };

        const result = await createSession(sessionData);

        if (result) {
            toast.add({
                title: 'Success',
                description: 'Session created successfully!',
                color: 'success'
            });
            router.push('/dashboard/sessions');
        }
    } catch (error) {
        console.error('Error creating session:', error);
        toast.add({
            title: 'Error',
            description: 'Failed to create session',
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <NuxtLink to="/dashboard/sessions" class="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                <Icon name="material-symbols:arrow-back" size="1.5rem" />
            </NuxtLink>
            <h1 class="text-2xl font-bold">Create New Session</h1>
        </div>

        <div class="max-w-5xl mx-auto">
            <div class="bg-surface-900/70 p-6 shadow-xl rounded-2xl">
                <form @submit.prevent="createNewSession" class="space-y-6">

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea v-model="description" id="description" rows="4" class="w-full p-3 bg-surface-950 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none transition-colors resize-none" placeholder="Describe your session"></textarea>
                    </div>

                    <div>
                        <label for="game-search" class="block text-sm font-medium text-gray-300 mb-1">Select Game</label>
                        <div class="relative">
                            <div class="flex items-center bg-surface-950 border-2 border-transparent rounded-xl focus-within:border-primary-500 transition-colors">
                                <Icon name="material-symbols:search" size="1.25rem" class="text-gray-400 ml-3" />
                                <input type="text" id="game-search" v-model="gameQuery" @input="debouncedSearch(gameQuery)" placeholder="Search for a game..." class="w-full p-3 bg-transparent outline-none text-white" />
                                <div v-if="isSearching" class="mr-3">
                                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                </div>
                            </div>

                            <div v-if="searchResults.length > 0" class="absolute z-50 mt-1 w-full bg-surface-900 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                                <ul>
                                    <li v-for="game in searchResults" :key="game.id" @click="selectGame(game)" class="p-3 hover:bg-surface-800 cursor-pointer flex items-center gap-3 border-b border-surface-700 last:border-0 duration-300">
                                        <img v-if="game.cover" :src="game.cover" :alt="game.name" class="h-12 object-cover rounded" />
                                        <div v-else class="h-12 w-12 bg-surface-950 rounded flex items-center justify-center">
                                            <Icon name="material-symbols:videogame-asset" size="1.5rem" class="text-gray-400" />
                                        </div>
                                        <div>
                                            <div class="font-medium text-white">{{ game.name }}</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div v-if="selectedGame" class="mt-3 p-3 bg-surface-950 rounded-xl border border-primary-500 flex items-center gap-3">
                            <img v-if="selectedGame.cover" :src="selectedGame.cover" :alt="selectedGame.name" class="h-16 object-cover rounded" />
                            <div v-else class="h-16 w-16 bg-surface-950 rounded flex items-center justify-center">
                                <Icon name="material-symbols:videogame-asset" size="1.5rem" class="text-gray-400" />
                            </div>
                            <div>
                                <div class="font-medium text-white">{{ selectedGame.name }}</div>
                            </div>
                            <button @click="clearSelectedGame" class="ml-auto flex p-1.5 rounded-full hover:bg-surface-700 text-gray-400 duration-300">
                                <Icon name="material-symbols:close" size="1.25rem" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">When to play</label>
                        <div class="space-y-3">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400">Playing in</span>
                                <div class="flex gap-2">
                                    <button v-for="time in [5, 15, 30, 45, 60]" :key="time" type="button" @click="updateScheduledTime(time)" class="px-3 py-1.5 rounded-lg transition-colors text-sm" :class="minutes === time ? 'bg-primary-600 text-white' : 'bg-surface-800 text-gray-300 hover:bg-surface-700'">
                                        {{ time }} min
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label for="custom-datetime" class="block text-sm font-medium text-gray-300 mb-1">Or select specific date and time:</label>
                                <input type="datetime-local" id="custom-datetime" v-model="customDateTime" @change="handleCustomDateTimeChange" class="bg-surface-950 border-2 border-transparent rounded-xl p-2 focus:border-primary-500 outline-none transition-colors text-white" />
                            </div>
                        </div>
                    </div>

                    <MemberSelector v-model:selectedMembers="selectedMembers" :available-friends="availableFriends" :is-loading="isLoading" label="Members" placeholder="Add members to session" :show-label="true" />
                    <GroupSelector v-model:selectedGroups="selectedGroups" :available-groups="availableGroups" :is-loading="isLoading" label="Groups" placeholder="Add groups to session" :show-label="true" />

                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" @click="router.push('/dashboard/sessions')" class="px-5 py-2 border border-primary-700 rounded-xl hover:bg-surface-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl" :disabled="isLoading">
                            <span v-if="isLoading" class="flex items-center justify-center gap-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </span>
                            <span v-else>Create Session</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
