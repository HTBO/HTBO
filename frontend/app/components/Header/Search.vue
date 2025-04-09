<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  searchValue: string;
}>();

const searchValue = useState<string>('searchValue');

const debouncedSearch = useDebounce((value: string) => {
  searchValue.value = value;
}, 300);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  debouncedSearch(target.value);
};
</script>

<template>
  <div class="relative">
    <Icon name="icons:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="1.25rem" />
    <input type="text" :value="searchValue" @input="handleInput" :placeholder="placeholder || 'Search...'" class="w-full pl-10 pr-4 py-2 bg-surface-800 placeholder-gray-400 border-2 border-surface-700 rounded-xl outline-none border-transparent focus:border-primary-600 duration-300" />
  </div>
</template>