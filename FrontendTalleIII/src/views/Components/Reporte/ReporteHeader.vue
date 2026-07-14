<template>
  <div class="relative overflow-hidden animate-fade-in-up">
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <FileText class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Reportes
            </h1>
            <p class="text-gray-600 mt-1 font-medium">Visualiza y exporta los datos del sistema</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FileText } from 'lucide-vue-next'
</script>
