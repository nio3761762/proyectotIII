<template>
  <div
    class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
  >
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div class="relative p-6">
      <!-- Promotion Image -->
      <div class="relative h-48 w-full mb-4 rounded-2xl overflow-hidden shadow-md">
        <img 
          v-if="promotion.Imagen?.Url"
          :src="promotion.Imagen?.Url" 
          :alt="promotion.Nombre" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
        >
          No Image
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Star class="h-4 w-4 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ promotion.Nombre }}
            </h3>
          </div>
          <p class="text-gray-600 text-sm leading-relaxed mb-3">{{ promotion.Descripcion }}</p>

          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
                promotion.Estado.IdEstado === 1
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
              ]"
            >
              {{ promotion.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
            </span>

            <div class="flex items-center gap-1 text-sm text-gray-500">
              <Clock class="h-4 w-4" />
              <span>{{ formatarValidez(promotion.Rango) }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div v-if="originalPromotionPrices[promotion.IdPromocion] !== promotionPrices[promotion.IdPromocion]" class="text-sm text-gray-500 line-through">
            Bs. {{ originalPromotionPrices[promotion.IdPromocion] || '0.00' }}
          </div>
          <div class="flex items-center gap-1 text-2xl font-bold text-orange-600">
            <DollarSign class="h-5 w-5" />
            {{ promotionPrices[promotion.IdPromocion] || '0.00' }}
          </div>
          <span class="text-xs text-gray-500">Precio final</span>
        </div>
      </div>

      <!-- productos Preview -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ promotion.Promocionproducto.filter(p => p?.Estado?.IdEstado === 1).length }} producto{{ promotion.Promocionproducto.filter(p => p?.Estado?.IdEstado === 1).length !== 1 ? 's' : '' }}
          </span>
          <button
            @click="$emit('toggle-expanded', promotion.IdPromocion)"
            class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
          >
            {{ expandedPromotions[promotion.IdPromocion] ? 'Ocultar' : 'Ver detalles' }}
            <ChevronDown v-if="!expandedPromotions[promotion.IdPromocion]" class="h-4 w-4" />
            <ChevronUp v-else class="h-4 w-4" />
          </button>
        </div>

        <div v-if="!expandedPromotions[promotion.IdPromocion]" class="flex flex-wrap gap-2">
          <div
            v-for="(product, index) in promotion.Promocionproducto.filter(p => p?.Estado?.IdEstado === 1).slice(0, 3)"
            :key="index"
            class="px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl text-xs text-gray-700 border border-orange-100"
          >
            {{ product.Producto?.Nombre || product.Paquete?.Nombre }}
          </div>
          <div
            v-if="promotion.Promocionproducto.length > 3"
            class="px-3 py-1 bg-gray-100 rounded-xl text-xs text-gray-500"
          >
            +{{ promotion.Promocionproducto.length - 3 }} más
          </div>
        </div>
      </div>

      <!-- Expanded Details -->
      <div
        v-if="expandedPromotions[promotion.IdPromocion]"
        class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100"
      >
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package class="h-4 w-4 text-orange-600" />
          Productos incluidos
        </h4>
        <div class="space-y-3">
          <div
            v-for="product in promotion.Promocionproducto.filter(p => p?.Estado?.IdEstado === 1)"
            :key="product.IdPromocionProducto"
            class="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ product.Producto?.Nombre || product.Paquete?.Nombre || 'N/A' }}</div>
              <div class="text-sm text-gray-500">
                Cantidad: {{ product.Cantidad }} • Descuento: {{ product.Descuento }}%
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-orange-600">
                {{ precioIndividual[product.IdPromocionProducto] || '0.00' }} Bs.
              </div>
              <div class="text-xs text-gray-400 line-through">
                {{ product.Producto ? ((precioUnico[product.Producto.IdProducto] || 0) * (product.Cantidad || 0)).toFixed(2) : ((product.Paquete.PrecioVenta || 0) * (product.Cantidad || 0)).toFixed(2) }} Bs.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="$emit('edit-promotion', promotion)"
          :disabled="promotion.Estado.IdEstado === 2"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>

        <button
          @click="$emit('delete-promotion', promotion)"
          :class="[
             'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
          promotion.Estado.IdEstado === 1
            ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          ]"
        >
          <Trash2 v-if="promotion.Estado.IdEstado === 1" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Clock, DollarSign, Package, ChevronDown, ChevronUp, Edit, Trash2, Check } from 'lucide-vue-next';

defineProps({
  promotion: Object,
  promotionPrices: Object,
  originalPromotionPrices: Object,
  expandedPromotions: Object,
  precioIndividual: Object,
  precioUnico: Object,
  formatarValidez: Function,
});
defineEmits(['toggle-expanded', 'edit-promotion', 'delete-promotion']);
</script>