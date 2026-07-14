<template>
  <div v-if="totalPaginas > 0" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
    <div class="text-gray-600 text-sm font-medium">
      Mostrando <span class="font-bold text-gray-800">{{ desde }}</span> –
      <span class="font-bold text-gray-800">{{ hasta }}</span> de
      <span class="font-bold text-gray-800">{{ total }}</span> 
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
      <div class="flex items-center gap-1">
        <button
          @click="changePage(paginaActual - 1)"
          :disabled="paginaActual === 1"
          class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <template v-for="item in paginasVisibles" :key="item">
          <span v-if="item === '...'" class="px-2 py-2 text-gray-400 text-sm">…</span>
          <button
            v-else
            @click="changePage(item)"
            :class="[
              'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
              paginaActual === item
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600'
            ]"
          >
            {{ item }}
          </button>
        </template>

        <button
          @click="changePage(paginaActual + 1)"
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
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  paginaActual: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
  total:        { type: Number, required: true },
  limite:       { type: Number, default: 8 },
});

const emit = defineEmits(['update:paginaActual']);

const desde = computed(() => (props.paginaActual - 1) * props.limite + 1);
const hasta  = computed(() => Math.min(props.paginaActual * props.limite, props.total));

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPaginas) {
    emit('update:paginaActual', page);
  }
};

const paginasVisibles = computed(() => {
  const total = props.totalPaginas;
  const actual = props.paginaActual;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);
  if (actual > 3) pages.push('...');
  for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) {
    pages.push(i);
  }
  if (actual < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});
</script>
