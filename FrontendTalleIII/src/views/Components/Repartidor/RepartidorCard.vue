<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 space-y-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
          <img v-if="repartidor.Persona?.Imagen?.Url" :src="repartidor.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
          <User v-else class="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-800">{{ repartidor.Persona.Nombre }} {{ repartidor.Persona.ApellidoPaterno }}</h3>
          <p class="text-gray-600 text-sm font-semibold" :class="{ 'text-green-600': repartidor.EmpresaReparto?.NombreEmpresa !== 'Independiente', 'text-gray-600': repartidor.EmpresaReparto?.NombreEmpresa === 'Independiente' }">{{ repartidor.EmpresaReparto?.NombreEmpresa }}</p>
        </div>
      </div>
      <span :class="['px-3 py-1 rounded-xl text-white text-sm font-medium', repartidor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
        {{ repartidor.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div class="space-y-2 text-sm text-gray-700">
      <div class="flex items-center gap-2">
        <IdCard class="h-4 w-4 text-orange-500" />
        <span>CI: {{ repartidor.Persona.Documento[0]?.Documento }} {{ repartidor.Persona.Documento[0]?.Complemento?.Nombre || '' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Briefcase class="h-4 w-4 text-gray-500" />
        <span>NIT: {{ repartidor.Persona.Documento[1]?.Documento || 'N/A' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Phone class="h-4 w-4 text-green-500" />
        <span>Cel: {{ repartidor.Persona.Celulares[0]?.Numero || 'N/A' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <ClipboardList class="h-4 w-4 text-red-500" />
        <span>Licencia: {{ repartidor.TipoLicencia?.NombreTipoLicencia }} - {{ repartidor.NumeroLicencia }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Car class="h-4 w-4 text-gray-500" />
        <span>Placa: {{ repartidor.PlacaVehiculo }}</span>
      </div>
    </div>

    <div class="flex gap-2 pt-4 border-t border-gray-200">
      <button @click="$emit('editRepartidor', repartidor)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
        <Edit class="h-4 w-4" /> Editar
      </button>
      <button @click="$emit('confirmChangeStatus', repartidor)"
      :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
      repartidor.Estado.IdEstado === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600']">
        <component :is="repartidor.Estado.IdEstado === 1 ? Trash2 : Check" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { User, IdCard, Briefcase, Phone, ClipboardList, Car, Edit, Trash2, Check } from 'lucide-vue-next';

const props = defineProps({
  repartidor: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['editRepartidor', 'confirmChangeStatus']);
</script>
