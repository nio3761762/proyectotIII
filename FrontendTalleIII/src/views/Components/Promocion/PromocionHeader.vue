<template>
  <div class="relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-orange-500/20 rounded-full blur-xl"></div>

    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Sparkles class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Promociones 
            </h1>
            <p class="text-gray-600 mt-1 font-medium">Gestiona todas tus ofertas especiales</p>
          </div>
        </div> 

        <div class="flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ activePromotions }}</div>
            <div class="text-sm text-gray-500">Activas</div>
          </div>
          <div class="w-px h-12 bg-gray-200"></div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ totalPromotions }}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
          <div class="p-2 bg-green-100 rounded-xl">
            <TrendingUp class="h-6 w-6 text-green-600" />
          </div>
          <button
            @click="$emit('new-promotion')"
            class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus class="h-4 w-4" />
            Nueva Promoción
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, TrendingUp } from 'lucide-vue-next';

defineProps({
  activePromotions: Number,
  totalPromotions: Number,
});
</script>