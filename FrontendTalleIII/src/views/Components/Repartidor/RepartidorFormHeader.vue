<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center gap-4">
        <button @click="$emit('cancelarEdicion')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
          <ArrowLeft class="h-5 w-5" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <UserPlus class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              {{ esNuevoRepartidor ? 'Registrar' : 'Actualizar' }} Repartidor
            </h1>
            <p class="text-gray-600 mt-1">
              {{ esNuevoRepartidor ? 'Crea un nuevo repartidor en el sistema' : 'Modifica los datos del repartidor' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { ArrowLeft, UserPlus } from 'lucide-vue-next';

const props = defineProps({
  esNuevoRepartidor: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['cancelarEdicion']);
</script>
