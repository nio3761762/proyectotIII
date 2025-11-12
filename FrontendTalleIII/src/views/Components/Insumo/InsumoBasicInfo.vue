<template>
  <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
      <Info class="h-5 w-5" />
      Información Básica
    </h3>
    <div class="space-y-4">
      <div>
        <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <Type class="h-4 w-4 text-orange-500" /> Nombre del Insumo
          <span class="text-red-500">(*)</span></label
        >
        <input
          :value="newProducto.Nombre"
          @input="
            $emit(
              'update:newProducto', {
                ...newProducto,
                Nombre: $event.target.value
              }
            );
            $emit('validate-field', 'nombre', $event.target.value);
          "
          type="text"
          placeholder="Ej: Harina de trigo"
          :class="[
            'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
            errors.nombre ? 'border-red-500' : 'border-orange-200',
          ]"
        />
        <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
          <AlertCircle class="h-3 w-3" />
          {{ errors.nombre }}
        </p>
      </div>
      <div>
        <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <FileText class="h-4 w-4 text-orange-500" /> Descripción
          <span class="text-red-500">(*)</span></label
        >
        <textarea
          :value="newProducto.Descripcion"
          @input="
            $emit(
              'update:newProducto', {
                ...newProducto,
                Descripcion: $event.target.value
              }
            );
            $emit('validate-field', 'descripcion', $event.target.value);
          "
          placeholder="Describe las características del insumo..."
          rows="3"
          :class="[
            'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-700 placeholder-gray-400',
            errors.descripcion ? 'border-red-500' : 'border-orange-200',
          ]"
        ></textarea>
        <p v-if="errors.descripcion" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
          <AlertCircle class="h-3 w-3" />
          {{ errors.descripcion }}
        </p>
      </div>
      <div>
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Bookmark class="h-4 w-4 text-orange-500" /> Marca
            <span class="text-red-500">(*)</span></label
          >
          <select
            :value="newProducto.IdMarca"
            @change="
              $emit(
                'update:newProducto', {
                  ...newProducto,
                  IdMarca: $event.target.value
                }
              );
              $emit('validate-field', 'marca', $event.target.value);
            "
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              errors.marca ? 'border-red-500' : 'border-orange-200',
            ]"
          >
            <option value="" disabled>Selecciona una marca</option>
            <option
              v-for="marca in marcas"
              :key="marca.IdMarca"
              :value="marca.IdMarca"
            >
              {{ marca.Nombre }}
            </option>
          </select>
          <p v-if="errors.marca" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.marca }}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-orange-500" /> Categoría
            <span class="text-red-500">(*)</span></label
          >
          <select
            :value="selectedCategoria"
            @change="
              $emit('update:selectedCategoria', $event.target.value);
              $emit('validate-field', 'subcategoria', newProducto.IdSubCategoria);
            "
            :class="[
              'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              errors.subcategoria ? 'border-red-500' : 'border-orange-200',
            ]"
          >
            <option value="" disabled hidden>Selecciona una categoría</option>
            <option
              v-for="cat in categorias"
              :key="cat.IdCategoria"
              :value="cat.IdCategoria"
            >
              {{ cat.Nombre }}
            </option>
          </select>
          <p v-if="errors.subcategoria" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.subcategoria }}
          </p>
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-orange-500" /> Subcategoría
            <span class="text-red-500">(*)</span></label
          >
          <select
            :value="newProducto.IdSubCategoria"
            :disabled="!selectedCategoria"
            @change="
              $emit(
                'update:newProducto', {
                  ...newProducto,
                  IdSubCategoria: $event.target.value
                }
              );
              $emit('validate-field', 'subcategoria', $event.target.value);
            "
            :class="[
              'w-full disabled:bg-gray-100 px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-400',
              errors.subcategoria ? 'border-red-500' : 'border-orange-200',
            ]"
          >
            <option value="" disabled hidden>Selecciona una subcategoría</option>
            <option
              v-for="cat in subcategoria"
              :key="cat.IdSubCategoria"
              :value="cat.IdSubCategoria"
            >
              {{ cat.Nombre }}
            </option>
          </select>
          <p v-if="errors.subcategoria" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.subcategoria }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
      <ImageIcon class="h-5 w-5" /> Imagen del Insumo
    </h3>
    <div class="flex items-center gap-4">
      <div class="w-full">
        <div class="space-y-4">
          <input
            type="file"
            accept="image/*"
            @change="$emit('handle-archivo', $event)"
            class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          <div v-if="previewUrl" class="flex justify-center">
            <div class="relative">
              <img
                :src="previewUrl"
                alt="Previsualización"
                class="w-48 h-48 object-cover rounded-2xl shadow-lg border-2 border-white"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Info,
  Type,
  Tag,
  FileText,
  Bookmark,
  ImageIcon,
  AlertCircle,
} from 'lucide-vue-next';

const props = defineProps({
  newProducto: Object,
  errors: Object,
  marcas: Array,
  categorias: Array,
  selectedCategoria: String,
  subcategoria: Array,
  previewUrl: String,
});

const emit = defineEmits([
  'update:newProducto',
  'update:selectedCategoria',
  'validate-field',
  'handle-archivo',
]);
</script>