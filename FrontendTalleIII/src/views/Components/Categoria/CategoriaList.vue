
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
    <CategoriaListItem
      v-for="categoria in categorias"
      :key="categoria.IdCategoria"
      :categoria="categoria"
      :categoriaExpandido="categoriaExpandido"
      :contarSubCategorias="contarSubCategorias"
      :obtenerSubCategoria="obtenerSubCategoria"
      @toggle-subcategorias="$emit('toggle-subcategorias', $event)"
      @editar="$emit('editar', $event)"
      @cambiar-estado="$emit('cambiar-estado', $event)"
    />
  </div>

  <!-- Empty State -->
  <div v-if="categorias.length === 0" class="text-center py-12">
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12">
      <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <LayoutGrid class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-4">No hay categorías</h3>
      <p class="text-gray-600 mb-6">No se encontraron categorías que coincidan con los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
import CategoriaListItem from './CategoriaListItem.vue';
import { LayoutGrid } from 'lucide-vue-next';

defineProps({
  categorias: {
    type: Array,
    required: true
  },
  categoriaExpandido: {
    type: Number,
    default: null
  },
  contarSubCategorias: {
    type: Function,
    required: true
  },
  obtenerSubCategoria: {
    type: Function,
    required: true
  }
});

defineEmits(['toggle-subcategorias', 'editar', 'cambiar-estado']);
</script>
