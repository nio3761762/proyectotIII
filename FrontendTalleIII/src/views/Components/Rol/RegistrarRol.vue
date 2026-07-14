<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="$emit('cancelar')"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative flex-shrink-0">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Shield class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ esEdicion ? 'Editar' : 'Nuevo' }} Rol</h2>
              <p class="text-orange-100 text-sm font-medium">
                {{ esEdicion ? 'Actualizar privilegios del sistema' : 'Definir un nuevo perfil de acceso' }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('cancelar')"
            class="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          <!-- Nombre del Rol -->
          <div class="space-y-2">
            <label class="flex items-center text-gray-700 font-bold mb-1 ml-1">
              <Type class="h-5 w-5 mr-2 text-orange-500" /> Nombre del Rol
            </label>
            <input
              v-model="form.nombre"
              :class="inputClass"
              placeholder="Ej: Administrador, Vendedor, Supervisor..."
              @input="errors.nombre = form.nombre ? '' : 'El nombre es requerido'"
            />
            <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1 ml-2">{{ errors.nombre }}</p>
          </div>

          <!-- Selección de Menús y Permisos -->
          <div class="space-y-4">
            <label class="flex items-center text-gray-700 font-bold mb-1 ml-1">
              <Layout class="h-5 w-5 mr-2 text-orange-500" /> Menús y Permisos
            </label>
            
            <div v-if="cargandoDatos" class="flex flex-col items-center justify-center py-12 space-y-4">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              <p class="text-gray-500 font-medium">Cargando configuración...</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="menu in menus" 
                :key="menu.IdMenu"
                :class="[
                  'p-4 rounded-3xl border transition-all duration-300',
                  isMenuSelected(menu) 
                    ? 'bg-orange-50/50 border-orange-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-md'
                ]"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div :class="['p-2 rounded-xl transition-colors', isMenuSelected(menu) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400']">
                      <Layout class="h-4 w-4" />
                    </div>
                    <span :class="['font-bold text-sm transition-colors', isMenuSelected(menu) ? 'text-orange-900' : 'text-gray-600']">
                      {{ menu.Nombre }}
                    </span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="isMenuSelected(menu)" @change="$emit('toggle-menu', menu)" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <!-- Permisos del Menú -->
                <Transition name="fade">
                  <div v-if="isMenuSelected(menu)" class="space-y-2 mt-4 pt-4 border-t border-orange-100">
                    <p class="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-2">Permisos Disponibles</p>
                    <div class="flex flex-wrap gap-2">
                      <label 
                        v-for="permiso in (permisosPorMenu[menu.IdMenu] || [])" 
                        :key="permiso.IdPermiso"
                        :class="[
                          'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                          isPermissionChecked(menu.IdMenu, permiso.IdPermiso)
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50'
                        ]"
                      >
                        <input 
                          type="checkbox" 
                          class="hidden"
                          :checked="isPermissionChecked(menu.IdMenu, permiso.IdPermiso)"
                          @change="(e) => $emit('update-permission', { menuId: menu.IdMenu, permisoId: permiso.IdPermiso, checked: e.target.checked })"
                        >
                        <Check v-if="isPermissionChecked(menu.IdMenu, permiso.IdPermiso)" class="h-3 w-3" />
                        {{ permiso.Nombre }}
                      </label>
                    </div>
                    <div v-if="!(permisosPorMenu[menu.IdMenu]?.length)" class="flex items-center justify-center py-2">
                       <div class="animate-pulse h-2 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-gray-50/80 border-t border-gray-100 flex gap-4 flex-shrink-0">
          <button
            type="button"
            @click="$emit('cancelar')"
            class="flex-1 px-6 py-3 border border-gray-200 hover:bg-gray-100 rounded-2xl bg-white transition-all text-gray-600 font-semibold flex items-center justify-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
            @click="onGuardar"
            :disabled="guardando || !formValido"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed font-bold"
          >
            <LoaderCircle v-if="guardando" class="animate-spin h-5 w-5" />
            <Save v-else class="h-5 w-5" />
            {{ guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Registrar') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { Shield, X, Type, Save, LoaderCircle, Layout, Check } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  rol: { type: Object, default: null },
  menus: { type: Array, default: () => [] },
  menusSeleccionados: { type: Array, default: () => [] },
  permisosSeleccionados: { type: Object, default: () => ({}) },
  permisosPorMenu: { type: Object, default: () => ({}) },
  guardando: { type: Boolean, default: false },
  cargandoDatos: { type: Boolean, default: false },
  esEdicion: { type: Boolean, default: false }
});

const emit = defineEmits(['cancelar', 'guardar', 'toggle-menu', 'update-permission']);

const form = reactive({
  nombre: ''
});

const errors = reactive({
  nombre: ''
});

const inputClass = computed(() => {
  const base = 'w-full px-5 py-4 border-0 shadow-sm bg-white rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-500/20 ring-1 ring-gray-200';
  return errors.nombre ? `${base} ring-2 ring-red-500/50 bg-red-50/30` : base;
});

const formValido = computed(() => {
  const tieneNombre = form.nombre.trim() !== '';
  const tieneMenus = props.menusSeleccionados.length > 0;
  const tienePermisos = Object.values(props.permisosSeleccionados).some(p => p && p.length > 0);
  return tieneNombre && tieneMenus && tienePermisos;
});

const isMenuSelected = (menu) => {
  return props.menusSeleccionados.some(m => m.IdMenu === menu.IdMenu);
};

const isPermissionChecked = (menuId, permisoId) => {
  return (props.permisosSeleccionados[menuId] || []).includes(permisoId);
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    form.nombre = props.rol?.nombre || props.rol?.Nombre || '';
    errors.nombre = '';
  }
});

const onGuardar = () => {
  if (formValido.value) {
    emit('guardar', { ...form });
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #fdba74;
  border-radius: 10px;
}
</style>
