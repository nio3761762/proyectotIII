<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
    <div class="text-gray-600 text-sm font-medium">
      {{ paginacionInfo }}
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
      <div class="flex items-center gap-1">
        <button
          @click="$emit('update:currentPage', currentPage - 1)"
          :disabled="currentPage === 1"
          class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('update:currentPage', page)"
          :class="[
            'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
            currentPage === page
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
              : 'hover:bg-orange-50 text-gray-600'
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="$emit('update:currentPage', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
  paginacionInfo: String,
});

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const currentPage = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(total - 1, currentPage + 2);

    if (currentPage > 4) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < total - 3) {
      pages.push('...');
    }
    pages.push(total);
  }
  return pages;
});

defineEmits(['update:currentPage']);
</script>