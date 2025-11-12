<template>
  <div>
    <!-- Products Grid -->
    <div v-if="selec === 'Producto'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
      <ProductoListItem
        v-for="producto in paginatedProductos"
        :key="producto.Producto.IdProducto"
        :producto="producto"
        :pp="pp"
        :expandedProducts="expandedProducts"
        :paquetesPorProducto="paquetesPorProducto"
        :calcularPaquetesPosibles="calcularPaquetesPosibles"
        :getPromocionesParaProducto="getPromocionesParaProducto"
        :promocionesPosiblesCalculadas="promocionesPosiblesCalculadas"
        :selectedTienda="selectedTienda"
        @open-photo-modal="$emit('open-photo-modal', $event)"
        @toggle-details="$emit('toggle-details', $event)"
        @update-cantidad-producto-en-tienda="$emit('update-cantidad-producto-en-tienda', $event[0], $event[1])"
        @update-cantidad-producto="$emit('update-cantidad-producto', $event[0], $event[1])"
        @open-edit-modal="$emit('open-edit-modal', $event)"
        @open-ingrediente-modal="$emit('open-ingrediente-modal', $event)"
        @open-presentations-modal-from-list="$emit('open-presentations-modal-from-list', $event)"
        @abrir-modal-activar-desactivar="$emit('abrir-modal-activar-desactivar', $event)"
      />
    </div>

    <!-- Presentations Grid -->
    <div v-if="selec === 'Presentacion'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductoPresentationItem
        v-for="paquete in paginatedPaquetes"
        :key="paquete.Paquete.IdPaquete"
        :paquete="paquete"
        :selectedTienda="selectedTienda"
        @update-cantidad-producto-en-tienda="$emit('update-cantidad-producto-en-tienda', $event[0], $event[1])"
        @update-cantidad-producto="$emit('update-cantidad-producto', $event[0], $event[1])"
      />
    </div>

    <!-- Empty State -->
    <div v-if="(selec === 'Producto' && paginatedProductos.length === 0) || (selec === 'Presentacion' && paginatedPaquetes.length === 0)" class="text-center py-12">
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12">
        <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package class="h-12 w-12 text-orange-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-4">No hay {{ selec === 'Producto' ? 'productos' : 'presentaciones' }}</h3>
        <p class="text-gray-600 mb-6">No se encontraron {{ selec === 'Producto' ? 'productos' : 'presentaciones' }} que coincidan con los filtros aplicados.</p>
        <button 
          v-if="selec === 'Producto'" 
          @click="$emit('open-add-modal')"
          class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
        >
          <Plus class="h-5 w-5" />
          <span class="font-semibold">Crear Primer Producto</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductoListItem from './ProductoListItem.vue';
import ProductoPresentationItem from './ProductoPresentationItem.vue';
import { Package, Plus } from 'lucide-vue-next';

defineProps({
  selec: String,
  paginatedProductos: Array,
  paginatedPaquetes: Array,
  pp: Object,
  expandedProducts: Object,
  paquetesPorProducto: Object,
  calcularPaquetesPosibles: Function,
  getPromocionesParaProducto: Function,
  promocionesPosiblesCalculadas: Object,
  selectedTienda: [String, Number],
});
defineEmits([
  'open-photo-modal',
  'toggle-details',
  'update-cantidad-producto-en-tienda',
  'update-cantidad-producto',
  'open-edit-modal',
  'open-ingrediente-modal',
  'open-presentations-modal-from-list',
  'abrir-modal-activar-desactivar',
  'open-add-modal',
]);
</script>