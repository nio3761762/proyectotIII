<template>
  <div>
    <!-- Desktop Grid View -->
    <div class="hidden md:block group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div class="relative p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center overflow-hidden shadow-lg">
              <DollarSign class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                {{ comision.Nombre }}
              </h3>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', comision.Estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
            {{ comision.Estado === 1 ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Cantidad</span>
            <span class="text-lg font-bold text-orange-600">{{ comision.Cantidad }}</span>
          </div>
        </div>
        <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Porcentaje</span>
            <span class="text-lg font-bold text-orange-600">{{ comision.Porcentaje }}%</span>
          </div>
        </div>
        <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Comision</span>
            <span class="text-lg font-bold text-orange-600">{{ ((comision.Cantidad * pp[comision.IdProducto]?.Precio) * (comision.Porcentaje / 100)).toFixed(2) }} Bs.</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="$emit('editar', comision)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Edit class="h-4 w-4" />
            Editar
          </button>
          <button @click="$emit('abrir-modal', comision)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', comision.Estado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700']">
            <Trash2 v-if="comision.Estado === 1" class="h-4 w-4" />
            <Check v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="md:hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center overflow-hidden shadow-lg">
              <DollarSign class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ comision.Nombre }}</h3>
              <p class="text-gray-600 text-sm">{{ comision.Producto }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', comision.Estado ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
            {{ comision.Estado ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Porcentaje</span>
            <span class="text-lg font-bold text-orange-600">{{ comision.Porcentaje }}%</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="$emit('editar', comision)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Edit class="h-4 w-4" />
            Editar
          </button>
          <button @click="$emit('abrir-modal', comision)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', comision.Estado ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600']">
            <Trash2 v-if="comision.Estado === 1" class="h-4 w-4" />
            <Check v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DollarSign, Edit, Trash2, Check } from 'lucide-vue-next';

defineProps({
  comision: {
    type: Object,
    required: true
  },
  pp: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'abrir-modal']);
</script>
