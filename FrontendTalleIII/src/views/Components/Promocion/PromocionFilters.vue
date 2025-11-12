<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
    <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
      <!-- Search Section -->
      <div class="flex-1 max-w-md">
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors" />
            <input
              :value="modelValue.nombre"
              @input="$emit('update:modelValue', { ...modelValue, nombre: $event.target.value })"
              placeholder="Buscar promociones..."
              class="w-full pl-12 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <button class="border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-2xl px-4 py-2 transition-all duration-300 bg-transparent flex items-center gap-2">
          <SlidersHorizontal class="h-4 w-4" />
          Filtros
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4 text-gray-500" />
        <span class="text-sm font-semibold text-gray-700">Estado:</span>
      </div>

      <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="$emit('update:modelValue', { ...modelValue, estado: status.value })"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300',
            modelValue.estado === status.value
              ? 'bg-white text-gray-800 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          ]"
        >
          <div class="flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full', status.color]"></div>
            {{ status.label }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, SlidersHorizontal, Filter } from 'lucide-vue-next';

defineProps({
  modelValue: Object,
  statusOptions: Array,
});
defineEmits(['update:modelValue']);
</script>