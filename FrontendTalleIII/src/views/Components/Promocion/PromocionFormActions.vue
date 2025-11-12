<template>
  <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
    <button
      type="button"
      @click="$emit('cancel-form')"
      class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
    >
      <X class="h-4 w-4" />
      Cancelar
    </button>
    <button
      type="submit"
      @click="$emit('save-promotion')"
      class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
    >
      <Save class="h-4 w-4" />
      Guardar Promoción
    </button>
  </div>
</template>

<script setup>
import { X, Save } from 'lucide-vue-next';

defineEmits(['cancel-form', 'save-promotion']);
</script>