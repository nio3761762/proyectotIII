<template>
  <!-- Insumos Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <InsumoListItem
      v-for="producto in paginatedInsumos"
      :key="producto.IdProducto"
      :producto="producto"
      :expanded="expandedInsumos[producto.IdProducto]"
      @toggle-details="(id) => $emit('toggle-details', id)"
      @edit-product="(producto) => $emit('edit-product', producto)"
      @delete-product="(producto) => $emit('delete-product', producto)"
    />
  </div>

  <!-- Empty State -->
  <div v-if="paginatedInsumos.length === 0" class="text-center py-12">
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12">
      <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-4">No hay insumos</h3>
      <p class="text-gray-600 mb-6">No se encontraron insumos que coincidan con los filtros aplicados.</p>
      <button
        @click="$emit('open-add-product-modal')"
        class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
      >
        <Plus class="h-5 w-5" />
        <span class="font-semibold">Crear Primer Insumo</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Package, Plus } from 'lucide-vue-next';
import InsumoListItem from './InsumoListItem.vue';

defineProps({
  paginatedInsumos: Array,
  expandedInsumos: Object,
});

defineEmits(['toggle-details', 'edit-product', 'delete-product', 'open-add-product-modal']);
</script>