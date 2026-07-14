<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 via-red-600 to-orange-700 p-8 text-white flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
            <Users class="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-black tracking-tight">Asignación de Personal</h2>
            <div class="flex items-center gap-2 mt-1">
              <Building2 class="h-4 w-4 text-orange-200" />
              <p class="text-orange-100 font-medium">{{ sucursal?.nombre }}</p>
            </div>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="bg-white/10 hover:bg-white/20 text-white transition-all p-2 rounded-xl backdrop-blur-sm"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Main Content Split Layout -->
      <div class="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
        
        <!-- Left Side: Unassigned Employees -->
        <div class="flex-1 flex flex-col border-r border-gray-200/60 overflow-hidden">
          <div class="p-5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UserPlus class="h-5 w-5 text-gray-400" />
              <h3 class="font-bold text-gray-700">Empleados Disponibles</h3>
            </div>
            <span class="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
              {{ empleadosDisponiblesLista.length }}
            </span>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div v-if="empleadosDisponiblesLista.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
              <div class="p-4 bg-gray-100 rounded-full mb-3">
                <Users class="h-10 w-10 text-gray-300" />
              </div>
              <p class="text-sm font-medium">No hay más empleados para asignar</p>
            </div>
            
            <div
              v-for="empleado in empleadosDisponiblesLista"
              :key="empleado.idempleado"
              class="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 border border-orange-50">
                  <img v-if="obtenerImagen(empleado)" :src="obtenerImagen(empleado)" class="w-full h-full object-cover" />
                  <span v-else class="text-orange-500 font-bold text-lg">
                    {{ iniciales(empleado) }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">
                    {{ obtenerNombre(empleado) }} {{ obtenerApellido(empleado) }}
                  </p>
                  <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {{ cargoNombre(empleado) }}
                  </p>
                </div>
              </div>
              <button
                @click="$emit('toggle-asignacion', empleado.idempleado)"
                class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm group-hover:scale-110"
              >
                <Plus class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Assigned Employees -->
        <div class="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
          <div class="p-5 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="h-5 w-5 text-green-500" />
              <h3 class="font-bold text-gray-700">Empleados Asignados</h3>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
              {{ empleadosAsignadosLista.length }}
            </span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-green-50/20">
            <div v-if="empleadosAsignadosLista.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
              <div class="p-4 bg-green-50 rounded-full mb-3">
                <UserCheck class="h-10 w-10 text-green-200" />
              </div>
              <p class="text-sm font-medium">No hay empleados asignados aún</p>
            </div>

            <div
              v-for="empleado in empleadosAsignadosLista"
              :key="empleado.idempleado"
              class="group bg-white p-3 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 border border-green-50">
                  <img v-if="obtenerImagen(empleado)" :src="obtenerImagen(empleado)" class="w-full h-full object-cover" />
                  <span v-else class="text-green-600 font-bold text-lg">
                    {{ iniciales(empleado) }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-gray-800 text-sm truncate group-hover:text-green-600 transition-colors">
                    {{ obtenerNombre(empleado) }} {{ obtenerApellido(empleado) }}
                  </p>
                  <p class="text-[11px] font-semibold text-green-600 uppercase tracking-wider">
                    {{ cargoNombre(empleado) }}
                  </p>
                </div>
              </div>
              <button
                @click="$emit('toggle-asignacion', empleado.idempleado)"
                class="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm group-hover:rotate-90"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-white p-6 flex justify-end gap-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <button
          @click="$emit('close')"
          class="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          @click="$emit('guardar')"
          class="px-10 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-xl shadow-orange-200 font-black tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Save class="h-5 w-5" />
          GUARDAR CAMBIOS
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X, Users, UserPlus, Save, Building2, Plus, CheckCircle2, UserCheck } from 'lucide-vue-next';

const props = defineProps({
  show:                { type: Boolean, required: true },
  sucursal:            { type: Object,  default: null  },
  empleadosDisponibles: { type: Array,   default: () => [] },
  empleadosAsignados:   { type: Array,   default: () => [] },
});

defineEmits(['close', 'toggle-asignacion', 'guardar']);

const estaAsignado = (e) => props.empleadosAsignados.some(a => a.id === e.idempleado);

const empleadosAsignadosLista = computed(() => 
  props.empleadosDisponibles.filter(e => estaAsignado(e))
);

const empleadosDisponiblesLista = computed(() => 
  props.empleadosDisponibles.filter(e => !estaAsignado(e))
);

const obtenerNombre = (e) => e.persona?.nombre ?? e.Persona?.Nombre ?? '';
const obtenerApellido = (e) => e.persona?.apellidopaterno ?? e.Persona?.ApellidoPaterno ?? '';
const obtenerImagen = (e) => e.persona?.imagen ?? e.Persona?.Imagen ?? null;

const cargoNombre = (e) => {
  if (e.cargo?.nombre) return e.cargo.nombre;
  if (e.Cargo?.Nombre) return e.Cargo.Nombre;
  return 'Sin cargo';
};

const iniciales = (e) => {
  const n = obtenerNombre(e);
  const a = obtenerApellido(e);
  return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
