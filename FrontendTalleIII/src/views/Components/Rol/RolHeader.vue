
<template>
  <div class="relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Shield class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Gestión de Roles
            </h1>
            <p class="text-gray-600 mt-1 font-medium">Administra todos los roles del sistema</p>
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ rolesActivos }}</div>
            <div class="text-sm text-gray-500">Activos</div>
          </div>
          <div class="w-px h-12 bg-gray-200"></div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ totalRoles }}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
          <div class="p-2 bg-green-100 rounded-xl">
            <TrendingUp class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Shield, TrendingUp } from 'lucide-vue-next';

defineProps({
  rolesActivos: {
    type: Number,
    required: true
  },
  totalRoles: {
    type: Number,
    required: true
  }
});
</script>
