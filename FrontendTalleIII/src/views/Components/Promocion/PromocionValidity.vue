<template>
  <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
    <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
      <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
        <Calendar class="h-5 w-5 text-orange-600" />
        Vigencia de la Promoción
      </h3>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Calendar class="h-4 w-4 mr-2 text-gray-500" /> Fecha de Inicio
          </label>
          <input
            :value="formData.Rango.FechaInicio"
            @input="$emit('update:formData', { ...formData, Rango: { ...formData.Rango, FechaInicio: $event.target.value } })"
            type="date"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          />
        </div>
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Calendar class="h-4 w-4 mr-2 text-gray-500" /> Fecha de Fin
          </label>
          <input
            :value="formData.Rango.FechaFin"
            @input="$emit('update:formData', { ...formData, Rango: { ...formData.Rango, FechaFin: $event.target.value } })"
            type="date"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          />
        </div>
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Clock class="h-4 w-4 mr-2 text-gray-500" /> Hora de Inicio
          </label>
          <input
            :value="formData.Rango.HoraInicio"
            @input="$emit('update:formData', { ...formData, Rango: { ...formData.Rango, HoraInicio: $event.target.value } })"
            type="time"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          />
        </div>
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Clock class="h-4 w-4 mr-2 text-gray-500" /> Hora de Fin
          </label>
          <input
            :value="formData.Rango.HoraFin"
            @input="$emit('update:formData', { ...formData, Rango: { ...formData.Rango, HoraFin: $event.target.value } })"
            type="time"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock } from 'lucide-vue-next';

defineProps({
  formData: Object,
});
defineEmits(['update:formData']);
</script>