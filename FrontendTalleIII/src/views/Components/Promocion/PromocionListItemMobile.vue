<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
  >
    <div class="p-6">
      <!-- Promotion Image for Mobile -->
      <div class="relative h-40 w-full mb-4 rounded-2xl overflow-hidden shadow-md">
        <img 
          v-if="promotion.Url"
          :src="promotion.Url" 
          :alt="promotion.Nombre" 
          class="w-full h-full object-cover"
        />
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
        >
          No Image
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ promotion.Nombre }}</h3>
          <p class="text-gray-600 text-sm mb-3">{{ promotion.Descripcion }}</p>
          <span
            :class="[
              'inline-block px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
              promotion.Estado.IdEstado === 1
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            ]"
          >
            {{ promotion.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="text-right">
          <div v-if="originalPromotionPrices[promotion.IdPromocion] !== promotionPrices[promotion.IdPromocion]" class="text-sm text-gray-500 line-through">
            Bs. {{ originalPromotionPrices[promotion.IdPromocion] || '0.00' }}
          </div>
          <div class="text-xl font-bold text-orange-600">
            {{ promotionPrices[promotion.IdPromocion] || '0.00' }} Bs.
          </div>
          <div class="text-xs text-gray-500">Precio final</div>
        </div>
      </div>

      <div class="flex gap-2 mb-4">
        <button
          @click="$emit('edit-promotion', promotion)"
          :disabled="promotion.Estado.IdEstado === 2"
          class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Edit class="h-4 w-4" />
          Editar
        </button>

        <button
          @click="$emit('delete-promotion', promotion)"
          :class="[
            'flex-1 rounded-xl px-3 py-2 text-sm font-medium border-0 text-white transition-colors flex items-center justify-center gap-1',
            promotion.Estado.IdEstado === 1
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-600'
          ]"
        >
          <Trash2 v-if="promotion.Estado.IdEstado === 1" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
          {{ promotion.Estado.IdEstado === 1 ? 'Desactivar' : 'Activar' }}
        </button>

        <button
          @click="$emit('toggle-expanded', promotion.IdPromocion)"
          class="text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 transition-colors"
        >
          <ChevronDown v-if="!expandedPromotions[promotion.IdPromocion]" class="h-4 w-4" />
          <ChevronUp v-else class="h-4 w-4" />
        </button>
      </div>

      <div
        v-if="expandedPromotions[promotion.IdPromocion]"
        class="p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100"
      >
        <h4 class="font-semibold text-gray-800 mb-3">Productos:</h4>
        <div class="space-y-2">
          <div
            v-for="product in promotion.Promocionproducto.filter(p => p?.Estado?.IdEstado === 1)"
            :key="product.IdPromocionProducto"
            class="text-sm"
          >
            <span class="font-medium text-gray-800">{{ product.Producto?.Nombre || product.Paquete?.Nombre || 'N/A' }}</span>
            <span class="text-gray-600"> (Cant: {{ product.Cantidad }}) - </span>
            <span class="text-orange-600 font-semibold">
              {{ precioIndividual[product.IdPromocionProducto] || '0.00' }} Bs.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Edit, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-vue-next';

defineProps({
  promotion: Object,
  promotionPrices: Object,
  originalPromotionPrices: Object,
  expandedPromotions: Object,
  precioIndividual: Object,
});
defineEmits(['edit-promotion', 'delete-promotion', 'toggle-expanded']);
</script>