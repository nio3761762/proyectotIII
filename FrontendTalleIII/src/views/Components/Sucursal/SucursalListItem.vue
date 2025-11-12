
<template>
  <div class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
    <div class="relative p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-lg">
            <Building class="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ sucursal.Nombre }}
            </h3>
            <p class="text-gray-600 text-sm">Nro: {{ sucursal.Nro }}</p>
          </div>
        </div>
        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
            sucursal.Estado.IdEstado === 1
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          ]"
        >
          {{ sucursal.Estado.IdEstado === 1 ? 'Activa' : 'Inactiva' }}
        </span>
      </div>

      <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Información Clave</span>
            <button
              @click="$emit('toggle-detalles', sucursal.IdSucursal)"
              class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
            >
              {{ sucursalExpandida === sucursal.IdSucursal ? 'Ocultar' : 'Ver más' }}
              <ChevronDown v-if="sucursalExpandida !== sucursal.IdSucursal" class="h-4 w-4" />
              <ChevronUp v-else class="h-4 w-4" />
            </button>
        </div>
        <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Clock class="h-4 w-4 text-blue-500" />
              <span>{{ sucursal.Horario.HoraEntrada }} - {{ sucursal.Horario.HoraSalida }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Phone class="h-4 w-4 text-green-500" />
              <span>{{ sucursal.Celular || 'N/A' }}</span>
            </div>
        </div>
      </div>

      <div v-if="sucursalExpandida === sucursal.IdSucursal" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
        <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
          <div class="font-semibold text-gray-800 mb-2 text-sm">Ubicación</div>
          <div class="flex items-start gap-2 text-xs text-gray-600">
            <MapPin class="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700">{{ sucursal.Direccion.Direccion }}</p>
              <p class="text-gray-500">Barrio: {{ sucursal.Direccion.Barrio.Nombre }}</p>
              <p class="text-gray-500">Ref: {{ sucursal.Direccion.Referencia || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200/80">
        <button @click="$emit('editar', sucursal)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Edit class="h-4 w-4" /> Editar
        </button>
        <div class="flex items-center gap-2" >
          <button
            @click="$emit('asignar-usuarios', sucursal)"
            class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center"
          >
            <Users class="h-4 w-4" />
          </button>
          <button
            @click="$emit('cambiar-estado', sucursal)"
            :class="[
              'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
              sucursal.Estado.IdEstado === 1
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            ]"
          >
            <Trash2 v-if="sucursal.Estado.IdEstado === 1" class="h-4 w-4" />
            <Check v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Building, Edit, Users, Trash2, Check, Clock, Phone, MapPin, ChevronDown, ChevronUp
} from 'lucide-vue-next';

defineProps({
  sucursal: {
    type: Object,
    required: true
  },
  sucursalExpandida: {
    type: Number,
    default: null
  }
});

defineEmits(['toggle-detalles', 'editar', 'asignar-usuarios', 'cambiar-estado']);
</script>

<style scoped>
@keyframes fade-in { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>
