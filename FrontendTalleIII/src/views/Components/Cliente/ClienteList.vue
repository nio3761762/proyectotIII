<template>
  <div class="mt-8">
    <div v-if="clientes && clientes.length > 0">
      <!-- Desktop Grid View -->
      <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ClienteListItem
          v-for="cliente in clientes"
          :key="cliente.IdPersona + '-desktop'"
          :cliente="cliente"
          :is-expanded="clienteExpandido === cliente.IdPersona"
          @toggle-detalles="$emit('toggle-detalles', cliente.IdPersona)"
          @editar="$emit('editar', cliente)"
          @abrir-modal="$emit('abrir-modal', cliente.IdPersona, cliente.Nombre, cliente.Estado.IdEstado)"
        />
      </div>

      <!-- Mobile View -->
      <div class="md:hidden space-y-4">
        <ClienteListItem
          v-for="cliente in clientes"
          :key="cliente.IdPersona + '-mobile'"
          :cliente="cliente"
          :is-expanded="clienteExpandido === cliente.IdPersona"
          @toggle-detalles="$emit('toggle-detalles', cliente.IdPersona)"
          @editar="$emit('editar', cliente)"
          @abrir-modal="$emit('abrir-modal', cliente.IdPersona, cliente.Nombre, cliente.Estado.IdEstado)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center mt-8">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center rounded-full">
        <Users class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay clientes</h3>
      <p class="text-gray-500">No se encontraron clientes que coincidan con los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
import ClienteListItem from './ClienteListItem.vue';
import { Users } from 'lucide-vue-next';

defineProps({
  clientes: {
    type: Array,
    required: true
  },
  clienteExpandido: {
    type: [Number, null],
    required: true
  }
});

defineEmits(['toggle-detalles', 'editar', 'abrir-modal']);
</script>