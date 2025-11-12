
<template>
  <div class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="relative p-6">
      <!-- Header Card -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Shield class="h-6 w-6 text-white" />
            </div>
            <div>
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{{ rol.Nombre }}</h3>
                <p class="text-gray-600 text-sm">{{ contarPermisos(rol.rolMenus) }} permisos</p>
            </div>
        </div>
        <span :class="[
          'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
          rol.Estado.IdEstado === 1 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        ]">
          {{ rol.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <!-- Permisos Preview -->
      <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Módulos con Acceso</span>
            <button
              @click="$emit('toggle-permisos', rol.IdRol)"
              class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
            >
              {{ permisoExpandido === rol.IdRol ? 'Ocultar' : 'Ver detalles' }}
              <ChevronDown v-if="permisoExpandido !== rol.IdRol" class="h-4 w-4" />
              <ChevronUp v-else class="h-4 w-4" />
            </button>
        </div>
        <div v-if="permisoExpandido !== rol.IdRol" class="flex flex-wrap gap-2">
          <span 
            v-for="menu in obtenerMenusDelRol(rol.rolMenus).slice(0, 3)" 
            :key="menu.IdMenu"
            class="px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl text-xs text-gray-700 border border-orange-100"
          >
            {{ menu.Nombre }}
          </span>
          <span 
            v-if="obtenerMenusDelRol(rol.rolMenus).length > 3"
            class="px-3 py-1 bg-gray-100 rounded-xl text-xs text-gray-500"
          >
            +{{ obtenerMenusDelRol(rol.rolMenus).length - 3 }} más
          </span>
        </div>
      </div>

      <!-- Expanded Details -->
      <div v-if="permisoExpandido === rol.IdRol" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
        <div 
          v-for="(grupo, idMenu) in agruparPermisosPorMenu(rol.rolMenus)"
          :key="idMenu"
          class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100"
        >
          <div class="font-semibold text-gray-800 mb-2 text-sm">{{ grupo.menu.Nombre }}</div>
          <div class="space-y-1">
            <div v-for="permiso in grupo.permisos" :key="permiso.IdPermiso" class="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle class="h-3 w-3 text-green-500" />
                <span>{{ permiso.Nombre }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="$emit('editar', rol)"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>
        <button
          @click="$emit('cambiar-estado', rol)"
          :class="[
            'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
            rol.Estado.IdEstado === 1
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          ]"
        >
          <Trash2 v-if="rol.Estado.IdEstado === 1" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Shield, Edit, Trash2, Check, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-vue-next';

defineProps({
  rol: {
    type: Object,
    required: true
  },
  permisoExpandido: {
    type: Number,
    default: null
  },
  contarPermisos: {
    type: Function,
    required: true
  },
  obtenerMenusDelRol: {
    type: Function,
    required: true
  },
  agruparPermisosPorMenu: {
    type: Function,
    required: true
  }
});

defineEmits(['toggle-permisos', 'editar', 'cambiar-estado']);
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
