<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Franja superior con imagen del producto -->
    <div class="relative h-28 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
      <img
        v-if="imagenProducto"
        :src="imagenProducto"
        :alt="comision.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <DollarSign class="h-12 w-12 text-orange-200" />
      </div>

      <!-- Badge estado -->
      <span :class="['absolute top-3 left-3 px-2.5 py-1 rounded-xl text-white text-xs font-semibold shadow-lg',
        comision.estado === 1
          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
          : 'bg-gradient-to-r from-gray-400 to-gray-500']">
        {{ comision.estado === 1 ? 'Activa' : 'Inactiva' }}
      </span>

      <!-- Badge precio comisión -->
      <div class="absolute bottom-3 right-3">
        <span class="bg-orange-500/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm">
          Bs. {{ Number(comision.preciocomision).toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Contenido -->
    <div class="relative p-5">

      <!-- Nombre + producto -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug mb-1">
          {{ comision.nombre }}
        </h3>
        <p class="text-xs text-orange-500 font-medium flex items-center gap-1">
          <ShoppingBag class="h-3 w-3" />
          {{ nombreProducto }}
        </p>
      </div>

      <!-- Stats: cantidad, porcentaje, precio venta -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div class="bg-orange-50/80 rounded-xl p-2.5 text-center">
          <p class="text-xs text-orange-600 font-semibold mb-0.5">Cantidad</p>
          <p class="text-base font-bold text-gray-800">{{ comision.cantidad }}</p>
        </div>
        <div class="bg-blue-50/80 rounded-xl p-2.5 text-center">
          <p class="text-xs text-blue-600 font-semibold mb-0.5">%</p>
          <p class="text-base font-bold text-gray-800">{{ Number(comision.porcentaje).toFixed(1) }}</p>
        </div>
        <div class="bg-green-50/80 rounded-xl p-2.5 text-center">
          <p class="text-xs text-green-600 font-semibold mb-0.5">P. Venta</p>
          <p class="text-base font-bold text-gray-800">Bs. {{ Number(precioVenta * comision.cantidad).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2 pt-3 border-t border-gray-100">
        <button
          @click="$emit('editar', comision)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm font-medium transition-all flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" /> Editar
        </button>
        <button
          @click="$emit('toggleEstado', comision)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all flex items-center justify-center',
            comision.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="comision.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="comision.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DollarSign, ShoppingBag, Pencil, ToggleLeft, ToggleRight } from 'lucide-vue-next';

const props = defineProps({
  comision: { type: Object, required: true },
});

defineEmits(['editar', 'toggleEstado']);

// Los datos llegan en minúsculas. Productomedida contiene el producto anidado
const pm = computed(() => props.comision.Productomedida ?? null);

const nombreProducto = computed(() =>
  pm.value?.Producto?.Nombre ?? props.comision.nombre ?? '—'
);

const imagenProducto = computed(() =>
  pm.value?.Imagen ?? pm.value?.Producto?.Imagen ?? ''
);

const precioVenta = computed(() => {
  const precio = pm.value?.PrecioVenta;
  return precio != null ? Number(precio).toFixed(2) : '—';
});
</script>
