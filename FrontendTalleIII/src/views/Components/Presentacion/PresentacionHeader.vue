<template>
  <div class="relative overflow-hidden">
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Users class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Gestión de Presentaciones
            </h1>
            <p class="text-gray-600 mt-1 font-medium">Administra todas las presentaciones del sistema</p>
          </div>
        </div>
        <button
          @click="$emit('new-presentation')"
          class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Plus class="h-4 w-4" />
          Nueva Presentación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, Plus } from 'lucide-vue-next';
</script>