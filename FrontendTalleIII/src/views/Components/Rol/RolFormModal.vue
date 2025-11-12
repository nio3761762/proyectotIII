
<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Shield class="h-6 w-6" />
            <h2 class="text-xl font-bold">
              {{ esEdicion ? 'Editar Rol' : 'Nuevo Rol' }}
            </h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto flex-grow">
        <div class="space-y-6">
          <!-- Nombre del Rol -->
          <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
              <Type class="h-5 w-5" />
              Información del Rol
            </h3>
            
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag class="h-4 w-4 text-orange-500" />
                Nombre del Rol
              </label>
              <input
                :value="rolActual.nombre"
                @input="$emit('update:rolActual', { ...rolActual, nombre: $event.target.value })"
                type="text"
                placeholder="Ej: Administrador, Vendedor, Supervisor..."
                class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300
             text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
                required
              />
            </div>
          </div>

          <!-- Selección de Menús y Permisos -->
          <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
              <Key class="h-5 w-5" />
              Permisos y Accesos
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2">
              <div 
                v-for="menu in menus" 
                :key="menu.IdMenu"
                class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 flex flex-col"
              >
                <!-- Botón de Menú -->
                <button
                  type="button"
                  @click="$emit('toggle-menu', menu)"
                  :class="[
                    'w-full text-left px-4 py-3 rounded-2xl border transition-all duration-300 font-semibold flex items-center gap-3 mb-4',
                    menusSeleccionados.some(m => m.IdMenu === menu.IdMenu)
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                      : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50 shadow-md'
                  ]"
                >
                  <Menu class="h-5 w-5" />
                  <span>{{ menu.Nombre }}</span>
                  <div class="ml-auto">
                    <Check v-if="menusSeleccionados.some(m => m.IdMenu === menu.IdMenu)" class="h-5 w-5" />
                  </div>
                </button>

                <!-- Permisos del Menú -->
                <div v-if="menusSeleccionados.some(m => m.IdMenu === menu.IdMenu)" class="space-y-3 animate-fade-in flex-grow">
                  <div class="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <Settings class="h-4 w-4" />
                    Permisos Disponibles
                  </div>
                  
                  <div v-if="!permisosPorMenu[menu.IdMenu] || permisosPorMenu[menu.IdMenu].length === 0" class="text-center py-4 flex-grow flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                    <p class="text-sm text-gray-500 mt-2">Cargando permisos...</p>
                  </div>
                  
                  <div v-else class="space-y-2">
                    <label 
                      v-for="permiso in permisosPorMenu[menu.IdMenu]" 
                      :key="permiso.IdPermiso"
                      class="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        :value="permiso.IdPermiso"
                        :checked="permisosSeleccionados[menu.IdMenu]?.includes(permiso.IdPermiso)"
                        @change="$emit('update:permisosSeleccionados', { menuId: menu.IdMenu, permisoId: permiso.IdPermiso, checked: $event.target.checked })"
                        class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div class="flex items-center gap-2 flex-1">
                        <CheckCircle class="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                        <span class="text-sm font-medium text-gray-700">{{ permiso.Nombre }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-3 flex-shrink-0">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2"
        >
          <X class="h-5 w-5" />
          Cancelar
        </button>
        
        <button
          @click="$emit('guardar-rol')"
          :disabled="!formValido"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save class="h-5 w-5" />
          {{ esEdicion ? 'Actualizar' : 'Crear' }} Rol
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Shield, X, Type, Tag, Key, Menu, Check, Settings, CheckCircle, Save
} from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, required: true },
  esEdicion: { type: Boolean, required: true },
  rolActual: { type: Object, required: true },
  menus: { type: Array, required: true },
  menusSeleccionados: { type: Array, required: true },
  permisosSeleccionados: { type: Object, required: true },
  permisosPorMenu: { type: Object, required: true },
  formValido: { type: Boolean, required: true },
});

defineEmits([
  'close',
  'update:rolActual',
  'update:menusSeleccionados',
  'update:permisosSeleccionados',
  'toggle-menu',
  'guardar-rol',
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
