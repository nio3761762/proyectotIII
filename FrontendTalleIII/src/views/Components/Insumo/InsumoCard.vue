<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Imagen -->
    <div class="relative h-40 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
      <img
        v-if="insumo.imagen"
        :src="insumo.imagen"
        :alt="insumo.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Package class="h-14 w-14 text-orange-300" />
      </div>
      <!-- Badge estado -->
      <span :class="['absolute top-3 left-3 px-2.5 py-1 rounded-xl text-white text-xs font-semibold shadow-lg',
        insumo.estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500']">
        {{ insumo.estado === 1 ? 'Activo' : 'Inactivo' }}
      </span>
      <!-- Botón foto -->
      <button
        @click.stop="$emit('actualizarFoto', insumo)"
        class="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-md transition-all"
        title="Actualizar foto"
      >
        <Camera class="h-4 w-4" />
      </button>
    </div>

    <div class="relative p-5">
      <!-- Nombre + categoría -->
      <div class="mb-3">
        <h3 class="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
          {{ insumo.nombre }}
        </h3>
        <p v-if="insumo.descripcion" class="text-gray-500 text-xs mt-0.5 line-clamp-1">{{ insumo.descripcion }}</p>
        <div class="flex items-center justify-between mt-2">
          <p class="text-xs text-orange-500 font-medium">
            {{ insumo.Subcategoria?.Categoria?.Nombre }}
            <span v-if="insumo.Subcategoria?.Nombre"> › {{ insumo.Subcategoria.Nombre }}</span>
          </p>
          <!-- Mostrar primera medida activa si existe -->
          <div v-if="insumo.Insumomedida?.find(m => m.Estado !== 0)" class="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg font-bold">
            {{ insumo.Insumomedida.find(m => m.Estado !== 0).Cantidad }} {{ insumo.Insumomedida.find(m => m.Estado !== 0).Unidadmedida?.Abreviatura }}
          </div>
        </div>
      </div>

      <!-- Stock mínimo -->
      <div v-if="insumo.stockminimo" class="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <AlertCircle class="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <span>Stock mínimo: <strong>{{ insumo.stockminimo }}</strong></span>
      </div>

      <!-- Medidas (colapsables) -->
      <div class="mb-4">
        <button
          @click="expandida = !expandida"
          class="w-full flex items-center justify-between px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <Scale class="h-3.5 w-3.5" />
            {{ insumo.Insumomedida?.length || 0 }} medida(s)
          </div>
          <ChevronDown :class="['h-4 w-4 text-orange-500 transition-transform', expandida ? 'rotate-180' : '']" />
        </button>

        <Transition name="slide-down">
          <div v-if="expandida" class="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <div
              v-for="m in insumo.Insumomedida"
              :key="m.IdinsumoMedida"
              class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-xs transition-opacity"
              :class="m.Estado === 0 ? 'opacity-50 grayscale' : ''"
            >
              <span class="text-gray-700 font-medium">
                {{ m.Cantidad }} {{ m.Unidadmedida?.Nombre }}
                <span class="text-gray-400">({{ m.Unidadmedida?.Abreviatura }})</span>
              </span>
            </div> 
          </div>
        </Transition>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2">
        <button
          @click="$emit('editar', insumo)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm transition-all flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" /> Editar
        </button>
        <button
          @click="$emit('toggleEstado', insumo)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all flex items-center justify-center',
            insumo.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="insumo.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="insumo.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Package, Camera, Pencil, ToggleLeft, ToggleRight, ChevronDown, Scale, AlertCircle } from 'lucide-vue-next';

defineProps({ insumo: { type: Object, required: true } });
defineEmits(['editar', 'toggleEstado', 'actualizarFoto']);

const expandida = ref(false);
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-6px); }
</style>
