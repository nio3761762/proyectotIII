<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mt-6 animate-fade-in-up delay-100">
    <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
      <div class="flex-1 max-w-md">
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors" />
            <input :value="filtros.nombre" @input="updateFiltro('nombre', $event.target.value)" placeholder="Buscar por nombre..." class="w-full pl-12 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none" />
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="$emit('nuevo')" class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Nuevo Usuario
        </button>
        <button @click="$emit('reporte')" class="border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-2xl px-4 py-2 transition-all duration-300 bg-transparent flex items-center gap-2">
          <FileText class="h-4 w-4" />
          Reporte
        </button>
      </div>
    </div>
    <div class="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4 text-gray-500" />
        <span class="text-sm font-semibold text-gray-700">Filtros:</span>
      </div>
      <div class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Rol:</label>
        <select :value="filtros.rol" @change="updateFiltro('rol', $event.target.value)" class="border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-orange-500 focus:ring-orange-500/20 outline-none transition-colors">
          <option v-for="rol in rolesDisponibles" :key="rol.IdRol" :value="rol.Nombre">
            {{ rol.Nombre }}
          </option>
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Estado:</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
          <button v-for="status in statusOptions" :key="status.value" @click="updateFiltro('estado', status.value)" :class="['px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300', filtros.estado === status.value ? 'bg-white text-gray-800 shadow-md transform scale-105' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50']">
            <div class="flex items-center gap-2">
              <div :class="['w-2 h-2 rounded-full', status.color]"></div>
              {{ status.label }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Filter, Plus, FileText } from 'lucide-vue-next';

const props = defineProps({
  filtros: {
    type: Object,
    required: true
  },
  rolesDisponibles: {
    type: Array,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:filtros', 'nuevo', 'reporte']);

const updateFiltro = (key, value) => {
  const nuevosFiltros = { ...props.filtros, [key]: value };
  emit('update:filtros', nuevosFiltros);
};
</script>
