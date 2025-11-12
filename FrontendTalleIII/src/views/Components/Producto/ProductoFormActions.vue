<template>
  <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
    <button
      type="button"
      @click="$emit('close-product-modal')"
      class="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
    >
      <X class="h-5 w-5" />
      Cancelar
    </button>
    
    <button
      @click="$emit('guardar-producto')"
      class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
    >
      <Save class="h-5 w-5" />
      {{ esEdicion ? 'Actualizar' : 'Guardar' }} Producto
    </button>
  </div>
</template>

<script setup>
import { X, Save } from 'lucide-vue-next';

defineProps({
  esEdicion: Boolean,
});
defineEmits(['close-product-modal', 'guardar-producto']);
</script>