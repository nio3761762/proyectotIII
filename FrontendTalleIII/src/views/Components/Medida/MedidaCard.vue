<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <div class="relative p-6">
      <!-- Cabecera: ícono + nombre + badge -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-md flex-shrink-0">
            <Ruler class="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ medida.nombre }}
            </h3>
            <p class="text-gray-400 text-xs mt-0.5">
              {{ unidadesActivas.length }} unidad{{ unidadesActivas.length !== 1 ? 'es' : '' }}
            </p>
          </div>
        </div>
        <!-- Badge estado -->
        <span :class="['px-3 py-1 rounded-xl text-white text-xs font-medium flex-shrink-0',
          medida.estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500']">
          {{ medida.estado === 1 ? 'Activa' : 'Inactiva' }}
        </span>
      </div>

      <!-- Unidades (colapsables) -->
      <div class="mb-4">
        <div v-if="unidadesActivas.length === 0" class="px-3 py-2 bg-gray-50/80 rounded-2xl text-xs text-gray-400 italic">
          Sin unidades activas
        </div>
        <template v-else>
          <!-- Vista colapsada: pills -->
          <div v-if="!expandida" class="flex flex-wrap gap-1.5">
            <span
              v-for="u in unidadesActivas.slice(0, 4)"
              :key="u.IdUnidadMedida"
              class="px-2.5 py-1 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl text-xs text-gray-700 font-medium"
            >
              {{ u.Nombre }} <span class="text-gray-400">({{ u.Abreviatura }})</span>
            </span>
            <button
              v-if="unidadesActivas.length > 4"
              @click="expandida = true"
              class="px-2.5 py-1 bg-gray-100 rounded-xl text-xs text-gray-500 hover:bg-orange-50 transition-colors"
            >
              +{{ unidadesActivas.length - 4 }} más
            </button>
          </div>
          <!-- Vista expandida -->
          <div v-else class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <div
              v-for="u in medida.Unidadmedida"
              :key="u.IdUnidadMedida"
              class="flex items-center justify-between px-3 py-2 bg-white/80 rounded-xl border border-gray-100 text-sm"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">{{ u.Nombre }}</span>
                <span class="text-gray-400 text-xs">({{ u.Abreviatura }})</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">x{{ u.Cantidad }}</span>
                <span :class="['px-1.5 py-0.5 rounded-lg text-xs font-semibold',
                  u.Estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ u.Estado === 1 ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
            </div>
            <button @click="expandida = false" class="text-xs text-orange-500 hover:underline mt-1 block">
              Ocultar
            </button>
          </div>
        </template>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2">
        <button
          @click="$emit('editar', medida)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm transition-all flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" /> Editar
        </button>
        <button
          @click="$emit('toggleEstado', medida)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all flex items-center justify-center',
            medida.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="medida.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="medida.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Ruler, Pencil, ToggleLeft, ToggleRight } from 'lucide-vue-next';

const props = defineProps({ medida: { type: Object, required: true } });
defineEmits(['editar', 'toggleEstado']);

const expandida = ref(false);
const unidadesActivas = computed(() =>
  props.medida.Unidadmedida?.filter(u => u.Estado === 1) ?? []
);
</script>
