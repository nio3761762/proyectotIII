<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
        <Package class="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
          {{ esEdicionProducto ? 'Editar Insumo' : 'Nuevo Insumo' }}
        </h1>
        <p class="text-gray-600 text-sm">Rellena los detalles del insumo</p>
      </div>
    </div>
  </div>
  <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full overflow-y-auto max-h-[90vh] animate-fade-in p-8">
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <InsumoBasicInfo
            :newProducto="newProducto"
            :errors="errors"
            :marcas="marcas"
            :categorias="categorias"
            :selectedCategoria="selectedCategoria"
            :subcategoria="subcategoria"
            :previewUrl="previewUrl"
            @update:newProducto="(value) => $emit('update:newProducto', value)"
            @update:selectedCategoria="(value) => $emit('update:selectedCategoria', value)"
            @validate-field="(field, value) => $emit('validate-field', field, value)"
            @handle-archivo="(event) => $emit('handle-archivo', event)"
          />
        </div>
        <div class="space-y-6">
          <InsumoMeasureUnits
            :newProducto="newProducto"
            :nuevaMedida="nuevaMedida"
            :medidaErrors="medidaErrors"
            :categoriaMedidas="categoriaMedidas"
            :selectedCategoriaMedida="selectedCategoriaMedida"
            :medidas="medidas"
            :medidaEnEdicionIndex="medidaEnEdicionIndex"
            @update:newProducto="(value) => $emit('update:newProducto', value)"
            @update:nuevaMedida="(value) => $emit('update:nuevaMedida', value)"
            @update:selectedCategoriaMedida="(value) => $emit('update:selectedCategoriaMedida', value)"
            @validate-medida-field="(field, value) => $emit('validate-medida-field', field, value)"
            @add-measure="$emit('add-measure')"
            @edit-measure="(index) => $emit('edit-measure', index)"
            @cancel-edit-measure="$emit('cancel-edit-measure')"
            @delete-measure="(index) => $emit('delete-measure', index)"
          />
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('close-product-modal')"
          class="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg font-semibold flex items-center gap-2"
        >
          <X class="h-5 w-5" /> Cancelar
        </button>
        <button
          type="submit"
          @click.prevent="$emit('save-product')"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold flex items-center gap-2"
        >
          <Save class="h-5 w-5" /> Guardar Insumo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, X, Save } from 'lucide-vue-next';
import InsumoBasicInfo from './InsumoBasicInfo.vue';
import InsumoMeasureUnits from './InsumoMeasureUnits.vue';

const props = defineProps({
  esEdicionProducto: Boolean,
  newProducto: Object,
  errors: Object,
  marcas: Array,
  categorias: Array,
  selectedCategoria: String,
  subcategoria: Array,
  previewUrl: String,
  nuevaMedida: Object,
  medidaErrors: Object,
  categoriaMedidas: Array,
  selectedCategoriaMedida: String,
  medidas: Array,
  medidaEnEdicionIndex: [Number, null],
});

const emit = defineEmits([
  'update:newProducto',
  'update:selectedCategoria',
  'validate-field',
  'handle-archivo',
  'update:nuevaMedida',
  'update:selectedCategoriaMedida',
  'validate-medida-field',
  'add-measure',
  'edit-measure',
  'cancel-edit-measure',
  'delete-measure',
  'close-product-modal',
  'save-product',
]);
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>