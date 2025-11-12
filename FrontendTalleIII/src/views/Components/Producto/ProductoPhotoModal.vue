<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
      <div class="p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Subir Foto del Producto</h2>
        <div class="space-y-4">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="$emit('handle-archivo', $event)"
            class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          <div v-if="previewUrl" class="flex justify-center">
            <div class="relative">
              <img 
                :src="previewUrl" 
                alt="Previsualización" 
                class="w-48 h-48 object-cover rounded-2xl shadow-lg border-2 border-white"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
          <button type="button" @click="$emit('close')" class="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg">Cancelar</button>
          <button type="button" @click="$emit('handle-image-upload'); $emit('close')" class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  show: Boolean,
  previewUrl: String,
});
defineEmits(['close', 'handle-archivo', 'handle-image-upload']);
</script>