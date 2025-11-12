<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
  >
    <!-- Product Image -->
    <div class="relative h-48 overflow-hidden">
      <div class="absolute top-4 left-4 z-10">
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm',
            producto.Estado.IdEstado === 1
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white',
          ]"
        >
          {{ producto.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
      <img
        :src="producto.Imagen?.Url || '/placeholder.svg?height=200&width=300'"
        :alt="producto.Descripcion"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
      ></div>
    </div>

    <!-- Product Info -->
    <div class="p-6">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {{ producto.Nombre }}
        </h3>
        <p class="text-gray-600 text-sm line-clamp-2">
          {{ producto.Descripcion }}
        </p>
        <p class="text-gray-500 text-xs mt-1">
          Categoría: {{ producto.Subcategoria.Categoria.Nombre }} >
          {{ producto.Subcategoria.Nombre }}
        </p>
      </div>

      <!-- Medidas Info -->
      <div
        class="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 mb-2">
            <Package class="h-4 w-4 text-orange-600" />
            <span class="text-sm font-semibold text-orange-700"
              >Medidas y Precios</span
            >
          </div>
          <button
            @click="$emit('toggle-details', producto.IdProducto)"
            class="text-orange-600 hover:text-orange-800"
          >
            <ChevronDown
              :class="{ 'rotate-180': expanded }"
              class="h-5 w-5 transition-transform"
            />
          </button>
        </div>
        <p class="text-sm text-gray-600">
          {{
            producto.Productomedida && producto.Productomedida.length > 0
              ? producto.Productomedida.length + ' medida(s) disponible(s)'
              : 'Sin medidas'
          }}
        </p>
      </div>

      <!-- Collapsible Details -->
      <transition name="fade">
        <div v-if="expanded" class="px-6 pb-4">
          <div
            v-if="producto.Productomedida && producto.Productomedida.length > 0"
            class="space-y-2"
          >
            <h4 class="text-sm font-semibold text-gray-700 mb-2">
              Detalles de Medidas:
            </h4>
            <div
              v-for="medida in producto.Productomedida"
              :key="medida.IdProductoMedida"
              class="text-xs p-2 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-600">
                {{ medida.Unidadmedida.Categoria.Nombre }}:
                {{ quitarDecimalesCero(medida.Cantidad) }}
                {{ medida.Unidadmedida.Abreviatura }} ({{
                  medida.Unidadmedida.Nombre
                }})
              </p>
              <p class="text-gray-600">
                Precio: {{ medida.PrecioVenta }} Bs. | P. Mayor:
                {{ medida.PrecioMayor }} Bs.
              </p>
            </div>
          </div>
          <div v-else>
            <p class="text-sm text-gray-500">
              Este insumo no tiene medidas configuradas.
            </p>
          </div>
        </div>
      </transition>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="$emit('edit-product', producto)"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>
        <button
          @click="$emit('delete-product', producto)"
          :class="[
            'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
            producto.Estado.IdEstado === 1
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
          ]"
        >
          <Trash2 v-if="producto.Estado.IdEstado === 1" class="h-4 w-4" />
          <RotateCcw v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Edit, Trash2, RotateCcw, ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  producto: Object,
  expanded: Boolean,
});

const quitarDecimalesCero = (valor) => {
  return Number(valor).toString();
};

defineEmits(['toggle-details', 'edit-product', 'delete-product']);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, max-height 0.3s ease;
  overflow: hidden;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  max-height: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  max-height: 500px; /* Adjust based on content height */
}
</style>