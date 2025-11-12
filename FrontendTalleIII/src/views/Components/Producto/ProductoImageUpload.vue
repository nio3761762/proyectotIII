<template>
  <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
    <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
      <ImageIcon class="h-4 w-4 text-gray-500" />
      Imagen del Producto
    </label>
    <div>
      <div v-if="!neewProducto?.Url">
        <div class="space-y-4">
          <input
            type="file"
            accept="image/*"
            @change="$emit('handle-archivo', $event)"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
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
      </div>
      <div v-else>
        <img :src="previewUrl || neewProducto?.Url || '/placeholder.svg?height=100&width=100'" alt="Previsualización" class="w-24 h-24 object-cover rounded-2xl shadow-lg border-2 border-white" />
        <button @click.prevent="$emit('open-photo-modal')" class="bg-white/80 backdrop-blur-sm text-purple-800 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          Cambiar Imagen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ImageIcon } from 'lucide-vue-next';

defineProps({
  neewProducto: Object,
  previewUrl: String,
});
defineEmits(['handle-archivo', 'open-photo-modal']);
</script>