<template>
  <div class="space-y-6 mt-8">
    <!-- Desktop Grid View -->
    <div class="hidden lg:grid grid-cols-1 xl:grid-cols-2 gap-6">
      <PromocionListItemDesktop
        v-for="promotion in promotions"
        :key="promotion.IdPromocion"
        :promotion="promotion"
        :promotionPrices="promotionPrices"
        :originalPromotionPrices="originalPromotionPrices"
        :expandedPromotions="expandedPromotions"
        :precioIndividual="precioIndividual"
        :precioUnico="precioUnico"
        :formatarValidez="formatarValidez"
        @toggle-expanded="$emit('toggle-expanded', $event)"
        @edit-promotion="$emit('edit-promotion', $event)"
        @delete-promotion="$emit('delete-promotion', $event)"
      />
    </div>

    <!-- Mobile View -->
    <div class="lg:hidden space-y-4">
      <PromocionListItemMobile
        v-for="promotion in promotions"
        :key="promotion.IdPromocion"
        :promotion="promotion"
        :promotionPrices="promotionPrices"
        :originalPromotionPrices="originalPromotionPrices"
        :expandedPromotions="expandedPromotions"
        :precioIndividual="precioIndividual"
        @toggle-expanded="$emit('toggle-expanded', $event)"
        @edit-promotion="$emit('edit-promotion', $event)"
        @delete-promotion="$emit('delete-promotion', $event)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="promotions.length === 0"
      class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center"
    >
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <Package class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay promociones</h3>
      <p class="text-gray-500">No se encontraron promociones que coincidan con los filtros aplicados</p>
    </div>
  </div>
</template>

<script setup>
import PromocionListItemDesktop from './PromocionListItemDesktop.vue';
import PromocionListItemMobile from './PromocionListItemMobile.vue';
import { Package } from 'lucide-vue-next';

defineProps({
  promotions: Array,
  promotionPrices: Object,
  originalPromotionPrices: Object,
  expandedPromotions: Object,
  precioIndividual: Object,
  precioUnico: Object,
  formatarValidez: Function,
});
defineEmits(['toggle-expanded', 'edit-promotion', 'delete-promotion']);
</script>