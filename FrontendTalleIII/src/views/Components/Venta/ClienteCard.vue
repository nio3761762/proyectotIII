<template>
  <div
    class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200"
  >
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <div class="relative p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
            <img v-if="persona.imagen" :src="persona.imagen" :alt="persona.nombre" class="w-12 h-12 object-cover" />
            <span v-else class="text-white font-bold text-lg">
              {{ persona.nombre?.charAt(0)?.toUpperCase() }}{{ persona.apellidopaterno?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ persona.nombre }} {{ persona.apellidopaterno }}
            </h3>
            <p class="text-gray-500 text-sm">{{ persona.apellidomaterno }}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-xl text-white text-xs font-medium flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600">
          Activo
        </span>
      </div>

      <div class="space-y-2 mb-4 p-3 bg-gray-50/80 rounded-2xl">
        <div v-if="persona.documento?.length" class="flex items-center gap-2 text-sm text-gray-600">
          <IdCard class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>CI: {{ persona.documento[0].documento }}</span>
        </div>
        <div v-if="persona.celulares?.length" class="flex items-center gap-2 text-sm text-gray-600">
          <Smartphone class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>{{ persona.celulares.map(c => c.numero).join(' / ') }}</span>
        </div>
        <div v-if="persona.direccion?.barrio" class="flex items-center gap-2 text-sm text-gray-600">
          <MapPin class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>{{ persona.direccion.barrio.nombre }}</span>
        </div>
        <div v-if="persona.email" class="flex items-center gap-2 text-sm text-gray-600">
          <Mail class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span class="truncate">{{ persona.email }}</span>
        </div>
      </div>

      <button
        @click="$emit('editar', persona)"
        class="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
        <Pencil class="h-4 w-4" />
        Editar Cliente
      </button>
    </div>
  </div>
</template>

<script setup>
import { IdCard, Smartphone, MapPin, Mail, Pencil } from 'lucide-vue-next';
defineProps({
  persona: { type: Object, required: true }
});
defineEmits(['editar']);
</script>
