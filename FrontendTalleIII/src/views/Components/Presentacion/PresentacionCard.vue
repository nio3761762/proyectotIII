<template>
  <div
    class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
  >
    <div class="relative p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
            {{ presentacion.Nombre || presentacion.nombre }}
          </h3>
          <p v-if="presentacion.Abreviatura || presentacion.abreviatura" class="text-sm font-medium text-gray-500 italic">
            ({{ presentacion.Abreviatura || presentacion.abreviatura }})
          </p>
        </div>
        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
            (presentacion.Estado === 1 || presentacion.estado === 1)
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          ]"
        >
          {{ (presentacion.Estado === 1 || presentacion.estado === 1) ? 'Activo' : 'Inactivo' }}
        </span> 
      </div>
      <div class="flex gap-2">
        <button
          @click="$emit('editar', presentacion)"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>
        <button
          @click="$emit('toggleEstado', presentacion)"
          :class="[
            'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
            (presentacion.Estado === 1 || presentacion.estado === 1)
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          ]"
        >
          <Trash2 v-if="(presentacion.Estado === 1 || presentacion.estado === 1)" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Edit, Trash2, Check } from 'lucide-vue-next';

defineProps({
  presentacion: { type: Object, required: true },
});

defineEmits(['editar', 'toggleEstado']);
</script>
