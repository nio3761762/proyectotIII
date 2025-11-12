<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
  >
    <!-- Presentation Image -->
    <div class="relative h-48 overflow-hidden">
      <img
        :src="paquete?.Paquete?.Imagen?.Url || '/placeholder.svg?height=200&width=300'"
        :alt="paquete?.Paquete?.Nombre"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      <!-- Price Tag -->
      <div class="absolute bottom-4 left-4">
        <span class="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
          {{ paquete.Paquete.PrecioVenta }} Bs
        </span>
         <span class="bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
          {{ paquete.Paquete.PrecioMayor }} Bs
        </span>
      </div>
    </div>

    <!-- Presentation Info -->
    <div class="p-6">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{{ paquete?.Paquete.Nombre }}</h3>
        <p class="text-gray-600 text-sm line-clamp-2">Contiene: {{paquete.Paquete.Cantidad}} de {{ paquete?.Paquete.Producto.Nombre }}</p>
      </div>

      <!-- Stock Info -->
      <div class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 mb-2">
            <Package class="h-4 w-4 text-blue-600" />
            <span class="text-sm font-semibold text-blue-700">Stock Disponible</span>
          </div>
        </div>
        <p class="text-lg font-bold text-gray-800"> {{ paquete.Cantidad }} Unidades</p>
      </div>

      <!-- Quantity Controls (if specific store selected) -->
      <div v-if="selectedTienda !== 'TODOS'" class="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
        <div class="flex items-center gap-2 mb-3">
          <Store class="h-4 w-4 text-green-600" />
          <span class="text-sm font-semibold text-green-700">Ajustar Stock</span>
        </div>
        <div class="flex items-center justify-center gap-2">
          <button
            @click="$emit('update-cantidad-producto-en-tienda', paquete, -1)"
            :disabled="paquete?.Cantidad <= 0"
            class="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            <Minus class="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>

          <input
            type="number"
            :value="paquete.Cantidad"
            @change="e => $emit('update-cantidad-producto', paquete, Number(e.target.value))"
            class="w-16 h-10 text-center border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
          />

          <button
            @click="$emit('update-cantidad-producto-en-tienda', paquete, 1)"
            class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group/btn"
          >
            <Plus class="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Store, Minus, Plus } from 'lucide-vue-next';

defineProps({
  paquete: Object,
  selectedTienda: [String, Number],
});
defineEmits([
  'update-cantidad-producto-en-tienda',
  'update-cantidad-producto',
]);
</script>