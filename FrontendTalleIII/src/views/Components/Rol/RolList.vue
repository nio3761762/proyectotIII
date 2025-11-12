
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
    <RolListItem
      v-for="rol in roles"
      :key="rol.IdRol"
      :rol="rol"
      :permisoExpandido="permisoExpandido"
      :contarPermisos="contarPermisos"
      :obtenerMenusDelRol="obtenerMenusDelRol"
      :agruparPermisosPorMenu="agruparPermisosPorMenu"
      @toggle-permisos="$emit('toggle-permisos', $event)"
      @editar="$emit('editar', $event)"
      @cambiar-estado="$emit('cambiar-estado', $event)"
    />
  </div>

  <!-- Empty State -->
  <div v-if="roles.length === 0" class="text-center py-12">
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12">
      <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-4">No hay roles</h3>
      <p class="text-gray-600 mb-6">No se encontraron roles que coincidan con los filtros aplicados.</p>
      <button 
        @click="$emit('nuevo-rol')"
        class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
      >
        <Plus class="h-5 w-5" />
        <span class="font-semibold">Crear Primer Rol</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import RolListItem from './RolListItem.vue';
import { Shield, Plus } from 'lucide-vue-next';

defineProps({
  roles: {
    type: Array,
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

defineEmits(['toggle-permisos', 'editar', 'cambiar-estado', 'nuevo-rol']);
</script>
