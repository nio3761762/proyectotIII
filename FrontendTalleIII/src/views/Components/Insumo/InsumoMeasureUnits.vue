<template>
  <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
      <Ruler class="h-5 w-5" />
      Unidades de Medida y Precios
    </h3>
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            Categoría de Medida <span class="text-red-500">(*)</span></label
          >
          <select
            :value="selectedCategoriaMedida"
            @change="
              $emit('update:selectedCategoriaMedida', $event.target.value);
              $emit('validate-medida-field', 'categoriaMedida', $event.target.value);
            "
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              medidaErrors.categoriaMedida ? 'border-red-500' : 'border-orange-200',
            ]"
          >
            <option value="" disabled>Seleccione una categoría</option>
            <option
              v-for="cat in categoriaMedidas"
              :key="cat.IdCategoriaMedida"
              :value="cat.IdCategoriaMedida"
            >
              {{ cat.Nombre }}
            </option>
          </select>
          <p
            v-if="medidaErrors.categoriaMedida"
            class="text-red-500 text-xs italic mt-1 flex items-center gap-1"
          >
            <AlertCircle class="h-3 w-3" />
            {{ medidaErrors.categoriaMedida }}
          </p>
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            Unidad de Medida <span class="text-red-500">(*)</span></label
          >
          <select
            :value="nuevaMedida.IdUnidadMedida"
            :disabled="!selectedCategoriaMedida"
            @change="
              $emit(
                'update:nuevaMedida', {
                  ...nuevaMedida,
                  IdUnidadMedida: $event.target.value
                }
              );
              $emit('validate-medida-field', 'idUnidadMedida', $event.target.value);
            "
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 text-gray-700 placeholder-gray-400',
              medidaErrors.idUnidadMedida ? 'border-red-500' : 'border-orange-200',
            ]"
          >
            <option value="" disabled>Seleccione</option>
            <option
              v-for="medida in medidas"
              :key="medida.IdUnidadMedida"
              :value="medida.IdUnidadMedida"
            >
              {{ medida.Nombre }}
            </option>
          </select>
          <p
            v-if="medidaErrors.idUnidadMedida"
            class="text-red-500 text-xs italic mt-1 flex items-center gap-1"
          >
            <AlertCircle class="h-3 w-3" />
            {{ medidaErrors.idUnidadMedida }}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <DollarSign class="h-4 w-4 text-orange-500" /> Precio Base
            <span class="text-red-500">(*)</span></label
          >
          <input
            :value="nuevaMedida.Precio"
            @input="
              $emit(
                'update:nuevaMedida', {
                  ...nuevaMedida,
                  Precio: parseFloat($event.target.value)
                }
              );
              $emit('validate-medida-field', 'precio', parseFloat($event.target.value));
            "
            type="number"
            step="0.01"
            placeholder="0.00"
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              medidaErrors.precio ? 'border-red-500' : 'border-orange-200',
            ]"
          />
          <p v-if="medidaErrors.precio" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ medidaErrors.precio }}
          </p>
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <DollarSign class="h-4 w-4 text-orange-500" /> Precio por Mayor
            <span class="text-red-500">(*)</span></label
          >
          <input
            :value="nuevaMedida.PrecioMayor"
            @input="
              $emit(
                'update:nuevaMedida', {
                  ...nuevaMedida,
                  PrecioMayor: parseFloat($event.target.value)
                }
              );
              $emit('validate-medida-field', 'precioMayor', parseFloat($event.target.value));
            "
            type="number"
            step="0.01"
            placeholder="0.00"
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              medidaErrors.precioMayor ? 'border-red-500' : 'border-orange-200',
            ]"
          />
          <p
            v-if="medidaErrors.precioMayor"
            class="text-red-500 text-xs italic mt-1 flex items-center gap-1"
          >
            <AlertCircle class="h-3 w-3" />
            {{ medidaErrors.precioMayor }}
          </p>
        </div>
      </div>
      <div>
        <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <Package class="h-4 w-4 text-orange-500" /> Cantidad por Paquete
          <span class="text-red-500">(*)</span></label
        >
        <input
          :value="nuevaMedida.Cantidad"
          @input="
            $emit(
              'update:nuevaMedida', {
                ...nuevaMedida,
                Cantidad: parseFloat($event.target.value)
              }
            );
            $emit('validate-medida-field', 'cantidad', parseFloat($event.target.value));
          "
          type="number"
          min="0"
          placeholder="0"
          :class="[
            'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
            medidaErrors.cantidad ? 'border-red-500' : 'border-orange-200',
          ]"
        />
        <p
          v-if="medidaErrors.cantidad"
          class="text-red-500 text-xs italic mt-1 flex items-center gap-1"
        >
          <AlertCircle class="h-3 w-3" />
          {{ medidaErrors.cantidad }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click.prevent="$emit('add-measure')"
          class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg font-semibold flex items-center justify-center gap-2"
        >
          <Plus v-if="medidaEnEdicionIndex === null" class="h-4 w-4" />
          <Save v-else class="h-4 w-4" />
          {{ medidaEnEdicionIndex === null ? 'Agregar Medida' : 'Actualizar Medida' }}
        </button>
        <button
          v-if="medidaEnEdicionIndex !== null"
          @click.prevent="$emit('cancel-edit-measure')"
          class="w-full bg-gray-500 text-white py-3 rounded-2xl shadow-lg font-semibold flex items-center justify-center gap-2"
        >
          <X class="h-4 w-4" />
          Cancelar
        </button>
      </div>
    </div>
    <div
      v-if="newProducto.Productomedida.length > 0"
      class="mt-6 pt-6 border-t border-orange-200"
    >
      <h4 class="text-md font-bold text-orange-800 mb-4">Medidas Agregadas</h4>
      <div class="space-y-3">
        <div
          v-for="(medida, index) in newProducto.Productomedida"
          :key="index"
          class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-orange-200 flex items-center justify-between"
        >
          <div>
            <p class="font-semibold text-gray-800">{{ medida.nombreUnidad }}</p>
            <p class="text-sm text-gray-600">
              {{ medida.nombreCategoria }}: {{ medida.Cantidad }}
              {{ medida.Abreviatura }} | Precio: {{ medida.Precio }} Bs. | Por
              Mayor: {{ medida.PrecioMayor }} Bs.
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click.prevent="$emit('edit-measure', index)"
              class="text-orange-600 hover:text-orange-900"
            >
              <Edit class="h-4 w-4" />
            </button>
            <button
              @click.prevent="$emit('delete-measure', index)"
              class="text-red-500 hover:text-red-700"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Ruler,
  DollarSign,
  Package,
  Plus,
  Save,
  X,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-vue-next';

const props = defineProps({
  newProducto: Object,
  nuevaMedida: Object,
  medidaErrors: Object,
  categoriaMedidas: Array,
  selectedCategoriaMedida: String,
  medidas: Array,
  medidaEnEdicionIndex: [Number, null],
});

const emit = defineEmits([
  'update:newProducto',
  'update:nuevaMedida',
  'update:selectedCategoriaMedida',
  'validate-medida-field',
  'add-measure',
  'edit-measure',
  'cancel-edit-measure',
  'delete-measure',
]);
</script>