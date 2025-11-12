<template>
  <div class="space-y-6">
    <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
      <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
        <Info class="h-5 w-5" />
        Información Básica
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Type class="h-4 w-4 text-gray-500" />
            Nombre del Producto <span class="text-red-500">(*)</span>
          </label>
          <input
            :value="neewProducto.Nombre"
            @input="$emit('update:neewProducto', { ...neewProducto, Nombre: $event.target.value }); $emit('validate-field', 'nombre', $event.target.value)"
            @blur="$emit('validate-field', 'nombre', $event.target.value)"
            type="text"
            placeholder="Ej: Coca Cola 500ml"
            :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
            required
          />
          <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.nombre }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <FileText class="h-4 w-4 text-gray-500" />
            Descripción <span class="text-red-500">(*)</span>
          </label>
          <textarea
            :value="neewProducto.Descripcion"
            @input="$emit('update:neewProducto', { ...neewProducto, Descripcion: $event.target.value }); $emit('validate-field', 'descripcion', $event.target.value)"
            @blur="$emit('validate-field', 'descripcion', $event.target.value)"
            placeholder="Describe las características del producto..."
            rows="3"
            :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 resize-none', { 'ring-2 ring-red-500/20 bg-red-50': errors.descripcion }]"
            required
          ></textarea>
          <p v-if="errors.descripcion" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.descripcion }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-gray-500" />
            Categoría <span class="text-red-500">(*)</span>
          </label>
          <select
            :value="selectedCategoria"
            @change="$emit('update:selectedCategoria', $event.target.value); $emit('validate-field', 'categoria', $event.target.value)"
            @blur="$emit('validate-field', 'categoria', $event.target.value)"
            :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.categoria }]"
          >
            <option value="" disabled hidden>Selecciona una categoría</option>
            <option
            v-for="cat in categorias" :key="cat.IdCategoria" :value="cat.IdCategoria">
              {{ cat.Nombre }}
            </option>
          </select>
          <p v-if="errors.categoria" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.categoria }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-gray-500" />
            Subcategoría <span class="text-red-500">(*)</span>
          </label>
          <select
            :value="neewProducto.IdSubCategoria"
             :disabled="!selectedCategoria"
            @change="$emit('update:neewProducto', { ...neewProducto, IdSubCategoria: $event.target.value }); $emit('validate-field', 'subcategoria', $event.target.value)"
            @blur="$emit('validate-field', 'subcategoria', $event.target.value)"
            :class="['w-full disabled:bg-gray-100 px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.subcategoria }]"
          >
            <option value="" disabled hidden class="invisible">Selecciona una subcategoría</option>
            <option v-for="cat in subcategoria" :key="cat.IdSubCategoria" :value="cat.IdSubCategoria">
              {{ cat.Nombre }}
            </option>
          </select>
          <p v-if="errors.subcategoria" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.subcategoria }}
          </p>
        </div>
        </div>
      
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Ruler class="h-4 w-4 text-gray-500" />
                Categoría de Medida <span class="text-red-500">(*)</span>
              </label>
              <select
                :value="selectedCategoriaMedida"
                @change="$emit('update:selectedCategoriaMedida', $event.target.value); $emit('validate-field', 'categoriaMedida', $event.target.value)"
                @blur="$emit('validate-field', 'categoriaMedida', $event.target.value)"
                :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.categoriaMedida }]"
              >
                <option value="" disabled>Selecciona una categoría</option>
                <option v-for="cat in categoriaMedidas" :key="cat.IdCategoriaMedida" :value="cat.IdCategoriaMedida">
                  {{ cat.Nombre }}
                </option>
              </select>
              <p v-if="errors.categoriaMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.categoriaMedida }}
              </p>
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Ruler class="h-4 w-4 text-gray-500" />
                Unidad de Medida <span class="text-red-500">(*)</span>
              </label>
              <select
                :value="neewProducto.IdUnidadMedida"
                @change="$emit('update:neewProducto', { ...neewProducto, IdUnidadMedida: $event.target.value }); $emit('validate-field', 'unidadMedida', $event.target.value)"
                @blur="$emit('validate-field', 'unidadMedida', $event.target.value)"
                :disabled="!selectedCategoriaMedida"
                :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 disabled:bg-gray-100', { 'ring-2 ring-red-500/20 bg-red-50': errors.unidadMedida }]"
              >
                <option value="" disabled>Selecciona una unidad</option>
                <option v-for="medida in medidas" :key="medida.IdUnidadMedida" :value="medida.IdUnidadMedida">
                  {{ medida.Nombre }}
                </option>
              </select>
              <p v-if="errors.unidadMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.unidadMedida }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
           <div><label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <DollarSign class="h-4 w-4 text-gray-500" />
              Precio Venta <span class="text-red-500">(*)</span>
            </label>
            <input
              :value="neewProducto.Precio"
              @input="$emit('update:neewProducto', { ...neewProducto, Precio: Number($event.target.value) }); $emit('validate-field', 'precio', $event.target.value)"
              @blur="$emit('validate-field', 'precio', $event.target.value)"
              type="number"
              step="0.01"
              placeholder="0.00"
              :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.precio }]"
              required
            />
            <p v-if="errors.precio" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.precio }}
            </p>
            </div>
               <div >
            <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <DollarSign class="h-4 w-4 text-gray-500" />
              Precio por Mayor <span class="text-red-500">(*)</span>
            </label>
            <input
              :value="neewProducto.PrecioMayor"
              @input="$emit('update:neewProducto', { ...neewProducto, PrecioMayor: Number($event.target.value) }); $emit('validate-field', 'precioMayor', $event.target.value)"
              @blur="$emit('validate-field', 'precioMayor', $event.target.value)"
              type="number"
              step="0.01"
              placeholder="0.00"
              :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.precioMayor }]"
              required
            />
            <p v-if="errors.precioMayor" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.precioMayor }}
            </p>
          </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Hash class="h-4 w-4 text-gray-500" />
                Stock Mínimo <span class="text-red-500">(*)</span>
              </label>
              <input
                :value="neewProducto.StockMinimo"
                @input="$emit('update:neewProducto', { ...neewProducto, StockMinimo: Number($event.target.value) }); $emit('validate-field', 'stockMinimo', $event.target.value)"
                @blur="$emit('validate-field', 'stockMinimo', $event.target.value)"
                type="number"
                min="0"
                placeholder="0"
                :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.stockMinimo }]"
                required
              />
              <p v-if="errors.stockMinimo" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.stockMinimo }}
              </p>
            </div>
          </div>
       
        </div>
      </div>

      <!-- Sección  de Ingredientes -->
      
    </div>
</template>

<script setup>
import { FileText, Type, Tag, DollarSign, Info, Hash, Ruler, AlertCircle } from 'lucide-vue-next';
import { watch } from 'vue';

const props = defineProps({
  neewProducto: Object,
  errors: Object,
  selectedCategoria: [String, Number],
  categorias: Array,
  subcategoria: Array,
  selectedCategoriaMedida: [String, Number],
  categoriaMedidas: Array,
  medidas: Array,
});

watch(() => props.errors, (newErrors) => {
  console.log('Errors prop in ProductoBasicInfo changed:', newErrors);
}, { deep: true });

defineEmits([
  'update:neewProducto',
  'validate-field',
  'update:selectedCategoria',
  'update:selectedCategoriaMedida',
]);
</script>