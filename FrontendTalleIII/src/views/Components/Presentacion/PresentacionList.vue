<template>
  <div class="space-y-6 mt-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <PresentacionListItem
        v-for="presentacion in presentaciones"
        :key="presentacion.IdPresentacion"
        :presentacion="presentacion"
        @edit="$emit('edit', $event)"
        @toggle-status="(id, nombre, estado) => $emit('toggle-status', id, nombre, estado)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="presentaciones.length === 0"
      class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center"
    >
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <Users class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay presentaciones</h3>
      <p class="text-gray-500">No se encontraron presentaciones que coincidan con los filtros aplicados</p>
    </div>
  </div>
</template>

<script setup>
import PresentacionListItem from './PresentacionListItem.vue';
import { Users } from 'lucide-vue-next';

defineProps({
  presentaciones: Array,
});
defineEmits(['edit', 'toggle-status']);
</script>