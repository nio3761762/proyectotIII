<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="md:hidden mb-6 space-y-3">
      <button
        @click="$emit('open-add-product-modal')"
        class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span class="font-semibold">Nuevo Insumo/Producto</span>
      </button>
    </div>

    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Search -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Search class="h-4 w-4 text-orange-500" />
            Buscar Insumos
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="Buscar por nombre o descripción..."
              class="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Plus } from 'lucide-vue-next';

defineProps({
  searchQuery: String,
});

defineEmits(['update:searchQuery', 'open-add-product-modal']);
</script>