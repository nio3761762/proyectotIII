<template>
  <div
    v-if="show"
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center"
  >
    <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
      <Truck class="h-12 w-12 text-orange-500" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay repartidores</h3>
    <p class="text-gray-500">No se encontraron repartidores que coincidan con los filtros aplicados</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { Truck } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});
</script>
