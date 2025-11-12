<template>
  <div
    v-if="formData.Promocionproducto.length > 0"
    class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden"
  >
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
          <Package class="h-5 w-5 text-purple-600" />
          Productos Agregados
        </h3>
        <div class="text-lg font-bold text-purple-600">{{ calculateTotalPrice() }} Bs.</div>
      </div>
    </div>
    <div class="p-6">
      <div class="space-y-3 max-h-80 overflow-y-auto">
        <div
          v-for="(product, index) in formData.Promocionproducto"
          :key="index"
          :class="[
            'p-4 rounded-2xl border transition-all duration-300',
            product.Estado.IdEstado === 2
              ? 'bg-gray-50 border-gray-200 opacity-60'
              : 'bg-white border-purple-100 hover:border-purple-200 hover:shadow-md'
          ]"
        >
          <div class="flex items-center justify-between">
            <div :class="{ 'line-through': product.Estado.IdEstado === 2 }">
              <div class="font-semibold text-gray-800">{{ product.Producto ? product.Producto.Nombre : product.Nombre }}</div>
              <div class="text-sm text-gray-600 mt-1">
                Cantidad: {{ product.Cantidad }} • Descuento: {{ product.Descuento }}%
              </div>
              <div class="text-lg font-bold text-purple-600 mt-2">
                {{ precioIndividual[product.IdPromocionProducto] || (product.PrecioVenta ? product.PrecioVenta.toFixed(2) : '0.00') }} Bs.
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="product.Estado.IdEstado === 1"
                type="button"
                @click="$emit('edit-item', index)"
                class="border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl px-3 py-2 transition-colors"
              >
                <Edit class="h-4 w-4" />
              </button>
              <button
                type="button"
                @click="$emit('remove-product', index)"
                :class="[
                  'rounded-xl px-3 py-2 transition-colors text-white',
                  product.Estado.IdEstado === 1
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                ]"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Edit, Trash2 } from 'lucide-vue-next';

defineProps({
  formData: Object,
  precioIndividual: Object,
  calculateTotalPrice: Function,
});
defineEmits(['edit-item', 'remove-product']);
</script>