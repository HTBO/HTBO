<script setup lang="ts">
import type { User } from '~/types/User';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
})

const router = useRouter();
const authStore = useAuthStore();

const description = ref('');
const selectedMembers = ref<string[]>([]);
const isLoading = ref(false);
const availableFriends = ref<User[]>([]);
const scheduledTime = ref<Date | null>(null);
const minutes = ref(30);
const customDateTime = ref('');

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

onMounted(() => {
    updateScheduledTime(minutes.value);
});

const createNewSession = async () => {
    // Implementation will go here
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
                        <label class="block text-sm font-medium text-gray-300 mb-1">When to play</label>
                        <div class="space-y-3">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400">Playing in</span>
                                <div class="flex gap-2">
                                    <button 
                                        v-for="time in [5, 15, 30, 45, 60]" 
                                        :key="time"
                                        type="button"
                                        @click="updateScheduledTime(time)"
                                        class="px-3 py-1.5 rounded-lg transition-colors text-sm" 
                                        :class="minutes === time ? 'bg-primary-600 text-white' : 'bg-surface-800 text-gray-300 hover:bg-surface-700'"
                                    >
                                        {{ time }} min
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label for="custom-datetime" class="block text-sm font-medium text-gray-300 mb-1">Or select specific date and time:</label>
                                <input 
                                    type="datetime-local" 
                                    id="custom-datetime" 
                                    v-model="customDateTime" 
                                    @change="handleCustomDateTimeChange"
                                    class="bg-surface-950 border-2 border-transparent rounded-xl p-2 focus:border-primary-500 outline-none transition-colors text-white"
                                />
                            </div>
                            
                            <div class="bg-surface-950 p-3 rounded-xl border-2 border-transparent focus-within:border-primary-500">
                                <div class="flex items-center">
                                    <Icon name="material-symbols:schedule" size="1.25rem" class="text-gray-400 mr-2" />
                                    <span v-if="scheduledTime" class="text-white">
                                        {{ scheduledTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} 
                                        on {{ scheduledTime.toLocaleDateString() }}
                                        <span v-if="minutes > 0">({{ minutes }} minutes from now)</span>
                                        <span v-else-if="minutes < 0">({{ Math.abs(minutes) }} minutes in the past)</span>
                                        <span v-else>(now)</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <MemberSelector v-model:selectedMembers="selectedMembers" :available-friends="availableFriends" :is-loading="isLoading" label="Members" :show-label="true"/>

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
