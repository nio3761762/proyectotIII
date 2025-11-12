
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
    <MedidaListItem
      v-for="categoria in categorias"
      :key="categoria.IdCategoriaMedida"
      :categoria="categoria"
      :categoriaExpandido="categoriaExpandido"
      :contarUnidades="contarUnidades"
      :obtenerUnidades="obtenerUnidades"
      :quitarDecimalesCero="quitarDecimalesCero"
      @toggle-unidades="$emit('toggle-unidades', $event)"
      @editar="$emit('editar', $event)"
      @cambiar-estado="$emit('cambiar-estado', $event)"
    />
  </div>

  <!-- Empty State -->
  <div v-if="categorias.length === 0" class="text-center py-12">
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12">
      <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ruler class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-4">No hay categorías de medida</h3>
      <p class="text-gray-600 mb-6">No se encontraron categorías que coincidan con los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
import MedidaListItem from './MedidaListItem.vue';
import { Ruler } from 'lucide-vue-next';

defineProps({
  categorias: {
    type: Array,
    required: true
  },
  categoriaExpandido: {
    type: Number,
    default: null
  },
  contarUnidades: {
    type: Function,
    required: true
  },
  obtenerUnidades: {
    type: Function,
    required: true
  },
  quitarDecimalesCero: {
    type: Function,
    required: true
  }
});

defineEmits(['toggle-unidades', 'editar', 'cambiar-estado']);
</script>
