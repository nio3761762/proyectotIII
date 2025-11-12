<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center gap-4">
        <button @click="$emit('close-form')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
          <ArrowLeft class="h-5 w-5" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Package class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              {{ isEditing ? 'Actualizar' : 'Nueva' }} Promoción
            </h1>
            <p class="text-gray-600 mt-1">
              {{ isEditing ? 'Modifica los detalles de la promoción' : 'Crea una nueva oferta especial' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Package } from 'lucide-vue-next';

defineProps({
  isEditing: Boolean,
});
defineEmits(['close-form']);
</script>