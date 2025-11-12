<template>
  <div class="mt-8">
    <div v-if="comisiones && comisiones.length > 0">
      <!-- Desktop Grid View -->
      <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ComisionListItem
          v-for="comision in comisiones"
          :key="comision.IdComision + '-desktop'"
          :comision="comision"
          :pp="pp"
          @editar="$emit('editar', comision)"
          @abrir-modal="$emit('abrir-modal', comision)"
        />
      </div>

      <!-- Mobile View -->
      <div class="md:hidden space-y-4">
        <ComisionListItem
          v-for="comision in comisiones"
          :key="comision.IdComision + '-mobile'"
          :comision="comision"
          :pp="pp"
          @editar="$emit('editar', comision)"
          @abrir-modal="$emit('abrir-modal', comision)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center mt-8">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <DollarSign class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay comisiones</h3>
      <p class="text-gray-500">No se encontraron comisiones que coincidan con los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
import ComisionListItem from './ComisionListItem.vue';
import { DollarSign } from 'lucide-vue-next';

defineProps({
  comisiones: {
    type: Array,
    required: true
  },
  pp: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'abrir-modal']);
</script>
