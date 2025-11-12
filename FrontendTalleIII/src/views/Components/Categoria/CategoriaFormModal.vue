
<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3"><LayoutGrid class="h-6 w-6" /><h2 class="text-xl font-bold">{{ esEdicion ? 'Editar' : 'Nueva' }} Categoría</h2></div>
          <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20"><X class="h-6 w-6" /></button>
        </div>
      </div>
      <div class="p-6 overflow-y-auto flex-grow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-blue-800 mb-4">Información Principal</h3>
              <div>
                <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Tag class="h-4 w-4 mr-2 text-gray-500" /> Nombre <span class="text-red-500">(*)</span>
                </label>
                <input
                  :value="categoriaActual.Nombre"
                  @input="$emit('update:categoriaActual', { ...categoriaActual, Nombre: $event.target.value })"
                  @blur="$emit('validate', 'nombre')"
                  :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
                  placeholder="Ej: Panadería"
                />
                <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ errors.nombre }}
                </p>
              </div>
              <div class="mt-4">
                <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Image class="h-4 w-4 mr-2 text-gray-500" /> Imagen
                </label>
                <input type="file" @change="$emit('handle-image-upload', $event)" accept="image/*" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                <div v-if="previewUrl" class="mt-4"><img :src="previewUrl" alt="Vista previa" class="w-24 h-24 rounded-2xl object-cover shadow-lg"/></div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-orange-800 mb-4">Subcategorías</h3>
            <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
              <div v-for="(sub, index) in categoriaActual.Subcategoria" :key="index" class="p-3 bg-white/80 rounded-xl shadow-sm border border-purple-100 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="flex items-center text-sm font-medium text-gray-700">
                    <Folder class="h-4 w-4 mr-2 text-gray-500" /> Subcategoría #{{ index + 1 }}
                  </label>
                  <button @click="$emit('toggle-subcategoria-estado', index)" type="button" :class="['p-2 rounded-full transition-colors', sub.Estado.IdEstado === 2 ? 'bg-green-100 hover:bg-green-200 text-green-600' : 'bg-red-100 hover:bg-red-200 text-red-600']">
                    <RotateCcw v-if="sub.Estado.IdEstado === 2" class="h-4 w-4"/>
                    <Trash2 v-else class="h-4 w-4"/>
                  </button>
                </div>
                <input
                  :value="sub.Nombre"
                  :disabled="sub.Estado.IdEstado === 2"
                  @input="$emit('update:subcategoria', { index, value: $event.target.value })"
                  @blur="$emit('validate-subcategoria', { index, value: sub.Nombre })"
                  :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.subcategorias[index] }]"
                  placeholder="Nombre de subcategoría"
                />
                <p v-if="errors.subcategorias[index]" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ errors.subcategorias[index] }}
                </p>
              </div>
            </div>
            <button @click="$emit('agregar-subcategoria')" type="button"  class="w-full mt-3 text-sm text-orange-700 font-semibold p-2 bg-orange-100 hover:bg-orange-200 rounded-xl">+ Añadir Subcategoría</button>
          </div>
        </div>
      </div>
      <div class="bg-gray-50/80 p-6 flex gap-3 flex-shrink-0">
        <button type="button" @click="$emit('close')" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg font-semibold">Cancelar</button>
        <button @click="$emit('guardar')" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-2xl shadow-lg font-semibold disabled:opacity-50">{{ esEdicion ? 'Actualizar' : 'Crear' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  LayoutGrid, X, Tag, Image, Folder, RotateCcw, Trash2, AlertCircle
} from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, required: true },
  esEdicion: { type: Boolean, required: true },
  categoriaActual: { type: Object, required: true },
  errors: { type: Object, required: true },
  previewUrl: { type: String, default: null },
});

defineEmits([
  'close',
  'update:categoriaActual',
  'handle-image-upload',
  'agregar-subcategoria',
  'toggle-subcategoria-estado',
  'guardar',
  'validate',
  'update:subcategoria',
  'validate-subcategoria',
]);
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
