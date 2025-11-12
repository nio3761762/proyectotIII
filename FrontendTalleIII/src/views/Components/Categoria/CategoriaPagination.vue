
<template>
  <div v-if="totalPaginas > 0" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
    <div class="text-gray-600 text-sm font-medium">
      {{ paginacionInfo }}
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
      <div class="flex items-center gap-1">
        <button
          @click="$emit('update:paginaActual', paginaActual - 1)"
          :disabled="paginaActual === 1"
          class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('update:paginaActual', page)"
          :class="[
            'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
            paginaActual === page
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
              : 'hover:bg-orange-50 text-gray-600'
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="$emit('update:paginaActual', paginaActual + 1)"
          :disabled="paginaActual === totalPaginas"
          class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  totalPaginas: {
    type: Number,
    required: true
  },
  paginaActual: {
    type: Number,
    required: true
  },
  paginacionInfo: {
    type: String,
    required: true
  },
  visiblePages: {
    type: Array,
    required: true
  }
});

defineEmits(['update:paginaActual']);
</script>
