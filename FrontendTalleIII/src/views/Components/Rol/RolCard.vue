<template>
  <div
    class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
  >
    <div class="relative p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
            <Shield class="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ rol.Nombre || rol.nombre }}
            </h3>
            <!-- <p class="text-xs text-gray-500">ID: {{ rol.IdRol || rol.idrol }}</p> -->
          </div>
        </div>
        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
            (rol.Estado === 1 || rol.estado === 1)
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          ]"
        >
          {{ (rol.Estado === 1 || rol.estado === 1) ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <!-- Sección de Menús/Permisos agrupados -->
      <div class="mb-6">
        <button 
          @click="$emit('togglePermisos', rol.IdRol || rol.idrol)"
          class="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
        >
          {{ permisoExpandido === (rol.IdRol || rol.idrol) ? 'Ocultar accesos' : 'Ver accesos y permisos' }}
          <ChevronDown :class="['h-4 w-4 transition-transform duration-300', permisoExpandido === (rol.IdRol || rol.idrol) ? 'rotate-180' : '']" />
        </button>

        <Transition name="expand">
          <div v-if="permisoExpandido === (rol.IdRol || rol.idrol)" class="mt-4 space-y-2 overflow-hidden">
            <div 
              v-for="(grupo, menuNombre) in permisosAgrupados" 
              :key="menuNombre" 
              class="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col gap-2"
            >
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-white rounded-lg shadow-sm">
                  <Layout class="h-3.5 w-3.5 text-orange-500" />
                </div>
                <span class="text-xs font-bold text-gray-700">{{ menuNombre }}</span>
              </div>
              
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="permiso in grupo" 
                  :key="permiso"
                  class="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-lg font-bold border border-orange-200/50 shadow-sm"
                >
                  {{ permiso }}
                </span>
              </div>
            </div>
            
            <div v-if="!(rol.rolMenus?.length)" class="text-xs text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              Sin permisos asignados
            </div>
          </div>
        </Transition>
      </div>

      <div class="flex gap-2">
        <button
          @click="$emit('editar', rol)"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>
        <button
          @click="$emit('toggleEstado', rol)"
          :class="[
            'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
            (rol.Estado === 1 || rol.estado === 1)
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          ]"
        >
          <Trash2 v-if="(rol.Estado === 1 || rol.estado === 1)" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Shield, Edit, Trash2, Check, ChevronDown, Layout } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
  rol: { type: Object, required: true },
  permisoExpandido: { type: [String, Number], default: null }
});

defineEmits(['editar', 'toggleEstado', 'togglePermisos']);

// Agrupar permisos por nombre de menú
const permisosAgrupados = computed(() => {
  const grupos = {};
  const menus = props.rol.rolMenus || [];
  
  menus.forEach(rm => {
    const nombreMenu = rm.menu?.Nombre || 'Sin nombre';
    if (!grupos[nombreMenu]) {
      grupos[nombreMenu] = [];
    }
    if (rm.Permiso?.Nombre) {
      grupos[nombreMenu].push(rm.Permiso.Nombre);
    }
  });
  
  return grupos;
});
</script>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 800px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}
</style>
