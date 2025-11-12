<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-orange-500/20 rounded-full blur-xl"></div>

    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <DollarSign class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Gestión de Comisiones
            </h1>
            <p class="text-gray-600 mt-1 font-medium">Administra todas las comisiones del sistema</p>
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ comisionesActivas }}</div>
            <div class="text-sm text-gray-500">Activas</div>
          </div>
          <div class="w-px h-12 bg-gray-200"></div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ totalComisiones }}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DollarSign } from 'lucide-vue-next';

defineProps({
  comisionesActivas: {
    type: Number,
    required: true
  },
  totalComisiones: {
    type: Number,
    required: true
  }
});
</script>
