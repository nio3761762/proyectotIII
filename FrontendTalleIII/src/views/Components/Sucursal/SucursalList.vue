
<template>
  <div class="space-y-6 mt-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
      <SucursalListItem
        v-for="sucursal in sucursales"
        :key="sucursal.IdSucursal"
        :sucursal="sucursal"
        :sucursalExpandida="sucursalExpandida"
        @toggle-detalles="$emit('toggle-detalles', $event)"
        @editar="$emit('editar', $event)"
        @asignar-usuarios="$emit('asignar-usuarios', $event)"
        @cambiar-estado="$emit('cambiar-estado', $event)"
      />
    </div>

    <div
      v-if="sucursales.length === 0"
      class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center"
    >
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <Building class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay sucursales</h3>
      <p class="text-gray-500">No se encontraron sucursales que coincidan con los filtros aplicados</p>
    </div>
  </div>
</template>

<script setup>
import SucursalListItem from './SucursalListItem.vue';
import { Building } from 'lucide-vue-next';

defineProps({
  sucursales: {
    type: Array,
    required: true
  },
  sucursalExpandida: {
    type: Number,
    default: null
  }
});

defineEmits(['toggle-detalles', 'editar', 'asignar-usuarios', 'cambiar-estado']);
</script>
