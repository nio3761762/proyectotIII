<template>
  <div class="mt-8">
    <div v-if="proveedores && proveedores.length > 0">
      <!-- Desktop Grid View -->
      <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ProveedorListItem
          v-for="proveedor in proveedores"
          :key="proveedor.IdProveedor + '-desktop'"
          :proveedor="proveedor"
          :is-expanded="proveedorExpandido === proveedor.IdProveedor"
          @toggle-detalles="$emit('toggle-detalles', proveedor.IdProveedor)"
          @editar="$emit('editar', proveedor)"
          @abrir-modal="$emit('abrir-modal', proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)"
        />
      </div>

      <!-- Mobile View -->
      <div class="md:hidden space-y-4">
        <ProveedorListItem
          v-for="proveedor in proveedores"
          :key="proveedor.IdProveedor + '-mobile'"
          :proveedor="proveedor"
          :is-expanded="proveedorExpandido === proveedor.IdProveedor"
          @toggle-detalles="$emit('toggle-detalles', proveedor.IdProveedor)"
          @editar="$emit('editar', proveedor)"
          @abrir-modal="$emit('abrir-modal', proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center mt-8">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <Users class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay proveedores</h3>
      <p class="text-gray-500">No se encontraron proveedores que coincidan con los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
import ProveedorListItem from './ProveedorListItem.vue';
import { Users } from 'lucide-vue-next';

defineProps({
  proveedores: {
    type: Array,
    required: true
  },
  proveedorExpandido: {
    type: [Number, null],
    required: true
  }
});

defineEmits(['toggle-detalles', 'editar', 'abrir-modal']);
</script>
