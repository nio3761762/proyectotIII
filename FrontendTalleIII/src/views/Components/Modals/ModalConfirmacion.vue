<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="$emit('cancelar')">
    <div class="bg-white/95 backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl max-w-md w-full p-6">
      <div class="text-center space-y-4">
        <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-lg">
          <AlertTriangle class="h-8 w-8 text-orange-600" />
        </div>
        <h3 class="text-2xl font-bold text-gray-800">{{ mensaje }}</h3>
        <p class="text-center text-gray-600 leading-relaxed">
          ¿Está seguro de que desea {{ mensaje.toLowerCase() }} 
          <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
            {{ nombreUsuario }}
          </span>?
        </p>
      </div>
      <div class="flex gap-3 mt-8">
        <button @click="$emit('confirmar')" class="flex-1 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-2xl py-3 transition-all duration-300 flex items-center justify-center gap-2">
          <Check class="h-4 w-4" />
          Sí, {{ mensaje }}
        </button>
        <button @click="$emit('cancelar')" class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
          <X class="h-4 w-4" />
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, Check, X } from 'lucide-vue-next';

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  nombreUsuario: {
    type: String,
    default: ''
  }
});

defineEmits(['confirmar', 'cancelar']);
</script>
