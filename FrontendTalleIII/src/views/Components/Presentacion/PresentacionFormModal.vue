<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Edit class="h-6 w-6" />
            <h2 class="text-xl font-bold">{{ esNuevaPresentacion ? 'Registrar' : 'Actualizar' }} Presentación</h2>
          </div>
          <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <form @submit.prevent="$emit('save')" class="space-y-6 mt-6">
          <div>
            <label class="flex text-gray-700 font-semibold mb-2 items-center gap-2">
              <Tag class="h-4 w-4 text-orange-500" />
              Nombre <span class="text-red-500">(*)</span>
            </label>
            <input
              :value="presentacion.Nombre"
              @input="$emit('update:presentacion', { ...presentacion, Nombre: $event.target.value })"
              :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
              placeholder="Ingresa el nombre"
              required
            />
            <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.nombre }}
            </p>
          </div>
        </form>
      </div>
      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Cancelar
        </button>

        <button
          @click="$emit('save')"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Edit, X, Tag, AlertCircle } from 'lucide-vue-next';

defineProps({
  show: Boolean,
  esNuevaPresentacion: Boolean,
  presentacion: Object,
  errors: Object,
});
defineEmits(['close', 'save', 'update:presentacion']);
</script>