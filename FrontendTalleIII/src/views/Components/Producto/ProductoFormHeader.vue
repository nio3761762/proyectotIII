<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
          <Package class="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
            {{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}
          </h1>
          <p class="text-gray-600 text-sm">{{ esEdicion ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto' }}</p>
        </div>
      </div>
      
      <button
        @click="$emit('close-product-modal')"
        class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Package, X } from 'lucide-vue-next';

defineProps({
  esEdicion: Boolean,
});
defineEmits(['close-product-modal']);
</script>