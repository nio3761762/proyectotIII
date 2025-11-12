<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="$emit('cancelar')">
    <div class="bg-white/95 backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Asignar Rol</h2>
          <button @click="$emit('cancelar')" class="text-white hover:text-gray-200 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-gray-700 font-semibold mb-2">Usuario</label>
          <input :value="nombreUsuario" readonly class="w-full border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 cursor-not-allowed" />
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-3">Seleccionar Rol</label>
          <div class="grid grid-cols-2 gap-3">
            <button v-for="rol in rolesDisponibles.filter(r => r.IdRol !== 'ROL-0')" :key="rol.IdRol" @click="selectedRole = rol.IdRol" :class="['px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium text-sm', selectedRole === rol.IdRol ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-500 shadow-lg' : 'border-orange-200 text-orange-600 hover:border-orange-300 hover:bg-orange-50']">
              {{ rol.Nombre }}
            </button>
          </div>
        </div>
        <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button @click="$emit('cancelar')" class="px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2">
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button @click="$emit('guardar', selectedRole)" :disabled="!selectedRole" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <Save class="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Save } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  rolesDisponibles: {
    type: Array,
    required: true
  },
  nombreUsuario: {
    type: String,
    default: ''
  },
  rolActual: {
    type: String,
    default: ''
  }
});

defineEmits(['guardar', 'cancelar']);

const selectedRole = ref(props.rolActual);

watch(() => props.rolActual, (newVal) => {
  selectedRole.value = newVal;
});
</script>
