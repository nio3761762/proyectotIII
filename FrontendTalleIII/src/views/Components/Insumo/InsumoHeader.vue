<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
          <Package class="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
            Gestión de Insumos
          </h1>
          <p class="text-gray-600 text-sm">Administra tus productos y suministros</p>
        </div>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <button
          @click="$emit('open-add-product-modal')"
          class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        >
          <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span class="font-semibold">Nuevo Insumo/Producto</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Plus } from 'lucide-vue-next';
</script>