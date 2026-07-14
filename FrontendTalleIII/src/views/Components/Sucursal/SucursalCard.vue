<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <div class="relative p-6">
      <!-- Cabecera: logo empresa + nombre + badge -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <!-- Foto de la empresa o ícono -->
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
            <img
              v-if="sucursal.datos?.foto"
              :src="sucursal.datos.foto"
              :alt="sucursal.datos?.nombre"
              class="w-14 h-14 object-cover"
            />
            <Building2 v-else class="h-7 w-7 text-orange-600" />
          </div>
          <div> 
            <!-- Nombre de la empresa -->
            <p v-if="sucursal.datos?.nombre" class="text-xs font-medium text-orange-500 mb-0.5">{{ sucursal.datos.nombre }}</p>
            <!-- Nombre de la sucursal -->
            <h3 class="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors leading-tight">
              {{ sucursal.nombre }}
            </h3>
            <p class="text-gray-400 text-xs">Nro: {{ sucursal.nro }}</p>
          </div>
        </div>
        <!-- Badge estado -->
        <span :class="['px-3 py-1 rounded-xl text-white text-xs font-medium flex-shrink-0',
          sucursal.estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500']">
          {{ sucursal.estado === 1 ? 'Activa' : 'Inactiva' }}
        </span>
      </div>

      <!-- Info -->
      <div class="space-y-2 mb-4 p-3 bg-gray-50/80 rounded-2xl">
        <!-- Horarios con Desplegable -->
        <div v-if="sucursal.horario?.length" class="border-b border-gray-100 pb-2 mb-2">
          <button 
            @click="mostrarHorarios = !mostrarHorarios"
            class="w-full flex items-center justify-between py-1 px-1 hover:bg-white rounded-xl transition-all duration-200 text-sm font-semibold text-gray-700 group/btn"
          >
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-blue-100 rounded-lg group-hover/btn:bg-blue-500 group-hover/btn:text-white transition-colors">
                <Clock class="h-3.5 w-3.5 text-blue-600 group-hover/btn:text-inherit" />
              </div>
              <span>Horarios de Atención</span>
            </div>
            <ChevronDown :class="['h-4 w-4 text-gray-400 transition-transform duration-300', mostrarHorarios ? 'rotate-180' : '']" />
          </button>
          
          <Transition name="slide-fade">
            <div v-if="mostrarHorarios" class="mt-2 space-y-1.5 pl-2 pr-1">
              <div v-for="h in sucursal.horario" :key="h.idhorario" class="flex flex-col text-[11px] text-gray-600 bg-white/50 p-1.5 rounded-xl border border-white">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-700 w-20">{{ h.dia }}</span>
                  <span class="flex items-center gap-1 font-medium text-blue-600">
                    {{ h.horaentrada }} <span class="text-gray-300">-</span> {{ h.horasalida }}
                  </span>
                </div>
                <div v-if="h.tipo" class="text-[9px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
                  {{ h.tipo }}
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Celular -->
        <div v-if="sucursal.celular" class="flex items-center gap-2 text-sm text-gray-600 px-1">
          <Phone class="h-4 w-4 text-green-500 flex-shrink-0" />
          <span class="font-medium">{{ sucursal.celular }}</span>
        </div>

        <!-- Dirección -->
        <div v-if="sucursal.direccion" class="flex items-start gap-2 text-sm text-gray-600 px-1">
          <MapPin class="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <span class="leading-tight">
            {{ sucursal.direccion.direccion }}
            <span v-if="sucursal.direccion.barrio" class="block text-xs text-gray-400 mt-0.5 font-medium">{{ sucursal.direccion.barrio.nombre }}</span>
          </span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2">
        <button
          @click="$emit('editar', sucursal)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm transition-all duration-200 flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          @click="$emit('asignarUsuario', sucursal)"
          class="w-9 h-9 flex-shrink-0 border border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600 rounded-2xl transition-all duration-200 flex items-center justify-center"
          title="Asignar empleados"
        >
          <Users class="h-4 w-4" />
        </button>
        <button
          @click="$emit('gestionarHornos', sucursal)"
          class="w-9 h-9 flex-shrink-0 border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-600 rounded-2xl transition-all duration-200 flex items-center justify-center"
          title="Gestionar Hornos"
        >
          <Flame class="h-4 w-4" />
        </button>
        <button
          @click="$emit('gestionarGastos', sucursal)"
          class="w-9 h-9 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl transition-all duration-200 flex items-center justify-center"
          title="Gestionar Gastos"
        >
          <Banknote class="h-4 w-4" />
        </button>
        <button
          @click="$emit('toggleEstado', sucursal)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all duration-200 flex items-center justify-center',
            sucursal.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="sucursal.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="sucursal.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Building2, Clock, Phone, MapPin, Pencil, Users, ToggleLeft, ToggleRight, ChevronDown, Flame, Banknote } from 'lucide-vue-next';

defineProps({ sucursal: { type: Object, required: true } });
defineEmits(['editar', 'asignarUsuario', 'toggleEstado', 'gestionarHornos', 'gestionarGastos']);

const mostrarHorarios = ref(false);
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
