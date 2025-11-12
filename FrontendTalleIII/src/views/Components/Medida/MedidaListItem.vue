
<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
            <Ruler class="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{{ categoria.Nombre }}</h3>
            <p class="text-gray-600 text-sm">{{ contarUnidades(categoria.Unidadmedida) }} unidades</p>
          </div>
        </div>
        <span :class="[
          'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium h-fit',
          categoria.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
        ]">
          {{ categoria.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Unidades de Medida</span>
          <button @click="$emit('toggle-unidades', categoria.IdCategoriaMedida)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
            {{ categoriaExpandido === categoria.IdCategoriaMedida ? 'Ocultar' : 'Ver' }}
            <ChevronDown v-if="categoriaExpandido !== categoria.IdCategoriaMedida" class="h-4 w-4" />
            <ChevronUp v-else class="h-4 w-4" />
          </button>
        </div>
        <div v-if="categoriaExpandido !== categoria.IdCategoriaMedida && obtenerUnidades(categoria.Unidadmedida).length > 0" class="flex flex-wrap gap-2">
          <div v-for="unidad in obtenerUnidades(categoria.Unidadmedida).slice(0, 3)" :key="unidad.IdUnidadMedida" class="px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl text-xs text-gray-700 border border-orange-100">
            {{ unidad.Nombre }} ({{ unidad.Abreviatura }})
          </div>
          <div v-if="obtenerUnidades(categoria.Unidadmedida).length > 3" class="px-3 py-1 bg-gray-100 rounded-xl text-xs text-gray-500">
            +{{ obtenerUnidades(categoria.Unidadmedida).length - 3 }} más
          </div>
        </div>
      </div>

      <div v-if="categoriaExpandido === categoria.IdCategoriaMedida" class="mb-4 space-y-2 animate-fade-in max-h-48 overflow-y-auto p-1">
        <div v-for="unidad in obtenerUnidades(categoria.Unidadmedida)" :key="unidad.IdUnidadMedida" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <span class="font-medium text-gray-700 text-sm">{{ unidad.Nombre }} ({{ unidad.Abreviatura }}) - Cant: {{ quitarDecimalesCero(unidad.Cantidad) }}</span>
          <span :class="[
            'px-2 py-0.5 rounded-full text-xs font-semibold',
            unidad.Estado.IdEstado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            {{ unidad.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="$emit('editar', categoria)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Edit class="h-4 w-4" /> Editar
        </button>
        <button
          @click="$emit('cambiar-estado', categoria)"
          :class="[
            'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
            categoria.Estado.IdEstado === 1
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          ]"
        >
          <Trash2 v-if="categoria.Estado.IdEstado === 1" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Ruler, Edit, Trash2, Check, ChevronDown, ChevronUp
} from 'lucide-vue-next';

defineProps({
  categoria: {
    type: Object,
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

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
