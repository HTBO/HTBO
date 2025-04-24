<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Group } from '~/types/Group';

const props = defineProps<{
  availableGroups: Group[];
  selectedGroups: string[];
  isLoading?: boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  showLabel?: boolean;
}>();

const emit = defineEmits<{
  'update:selectedGroups': [selectedGroups: string[]];
}>();

const showGroupSelector = ref(false);
const searchQuery = ref('');
const groupSelectorRef = ref<HTMLElement | null>(null);

// Default values for customizable text
const labelText = computed(() => props.label || 'Groups');
const placeholderText = computed(() => props.placeholder || 'Add groups');
const emptyText = computed(() => props.emptyMessage || 'No groups found. Create groups to select them.');

const filteredGroups = computed(() => {
  if (!searchQuery.value) return props.availableGroups;

  const query = searchQuery.value.toLowerCase();
  return props.availableGroups.filter(group =>
    group.name.toLowerCase().includes(query)
  );
});

const toggleGroupSelection = (groupId: string) => {
  const updatedGroups = [...props.selectedGroups];
  const index = updatedGroups.indexOf(groupId);
  
  if (index === -1) {
    updatedGroups.push(groupId);
  } else {
    updatedGroups.splice(index, 1);
  }
  
  emit('update:selectedGroups', updatedGroups);
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    showGroupSelector.value && 
    groupSelectorRef.value && 
    !groupSelectorRef.value.contains(event.target as Node)
  ) {
    showGroupSelector.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div>
    <label v-if="showLabel !== false" class="block text-sm font-medium text-gray-300 mb-2">{{ labelText }}</label>
    
    <div v-if="selectedGroups.length > 0" class="mb-4 flex flex-wrap gap-2">
      <div v-for="groupId in selectedGroups" :key="groupId" class="bg-surface-700 px-3 py-1 rounded-full flex items-center gap-1">
        <span class="text-sm">{{ availableGroups.find(g => g.id === groupId)?.name || groupId }}</span>
        <button 
          type="button" 
          @click.stop="toggleGroupSelection(groupId)" 
          class="flex items-center text-gray-400 hover:text-white duration-300"
        >
          <Icon name="material-symbols:close" size="1rem" />
        </button>
      </div>
    </div>

    <div class="relative" ref="groupSelectorRef">
      <button 
        type="button" 
        @click.stop="showGroupSelector = !showGroupSelector" 
        class="w-full p-3 bg-surface-950 border-2 border-transparent rounded-xl hover:border-primary-500 focus:border-primary-500 outline-none transition-colors text-left flex justify-between items-center"
      >
        <span class="text-gray-400">{{ placeholderText }}</span>
        <Icon :name="showGroupSelector ? 'material-symbols:expand-less' : 'material-symbols:expand-more'" />
      </button>

      <div v-if="showGroupSelector" class="absolute z-10 mt-2 w-full border-2 border-surface-700 rounded-xl p-4 bg-surface-900 space-y-4 shadow-xl">
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="w-full p-2 pl-8 bg-surface-950 border border-surface-700 rounded-lg focus:border-primary-500 outline-none" 
            placeholder="Search groups..." 
          />
          <Icon 
            name="material-symbols:search" 
            size="1.25rem" 
            class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" 
          />
        </div>

        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>

        <div v-else-if="filteredGroups.length === 0" class="text-center py-4 text-gray-400">
          {{ emptyText }}
        </div>

        <div v-else class="max-h-64 overflow-y-auto space-y-2">
          <div 
            v-for="group in filteredGroups" 
            :key="group.id" 
            class="flex items-center justify-between p-2 hover:bg-surface-800 rounded-lg cursor-pointer transition-colors" 
            @click="toggleGroupSelection(group.id)"
          >
            <div class="flex items-center gap-3">
              <div class="size-8 bg-surface-600 rounded-full flex items-center justify-center">
                <Icon name="icons:group" size="1rem" class="text-gray-300" />
              </div>
              <span>{{ group.name }}</span>
            </div>
            <div 
              class="w-5 h-5 rounded border flex items-center justify-center" 
              :class="selectedGroups.includes(group.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-500'"
            >
              <Icon 
                v-if="selectedGroups.includes(group.id)" 
                name="material-symbols:check" 
                size="0.875rem" 
                class="text-white" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>