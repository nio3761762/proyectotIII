<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="md:hidden mb-6 space-y-3">
      <button 
        @click="$emit('open-add-modal')" 
        class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <Plus class="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
        <span class="font-semibold">Nuevo Producto</span>
      </button>
      
      <button 
        @click="$emit('export-pdf')" 
        class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <FileText class="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
        <span class="font-semibold">Generar Reporte</span>
      </button>
    </div>

    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Search -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Search class="h-4 w-4 text-orange-500" />
            Buscar Productos
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="Buscar por nombre o descripción..."
              class="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Store Filter -->
        <div v-if="!TIeneSucursal" class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Store class="h-4 w-4 text-orange-500" />
            Filtrar por Tienda
          </label>
          <select
            :value="selectedTienda"
            @change="$emit('update:selectedTienda', $event.target.value)"
            class="w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700"
          >
            <option v-for="tienda in sucursales" :key="tienda.IdSucursal" :value="tienda.IdSucursal">
              {{ tienda.Nombre }}
            </option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <!-- Category Filter -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag class="h-4 w-4 text-orange-500" />
            Categoría
          </label>
          <select :value="filtroCategoria" @change="$emit('update:filtroCategoria', $event.target.value)" class="w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700">
            <option value="TODOS">Todas las categorías</option>
            <option v-for="cat in categorias" :key="cat.IdCategoria" :value="cat.IdCategoria">{{ cat.Nombre }}</option>
          </select>
        </div>

        <!-- Subcategory Filter -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag class="h-4 w-4 text-orange-500" />
            Subcategoría
          </label>
          <select :value="filtroSubcategoria" @change="$emit('update:filtroSubcategoria', $event.target.value)" :disabled="filtroCategoria === 'TODOS'" class="w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 disabled:bg-gray-100">
            <option value="TODOS">Todas las subcategorías</option>
            <option v-for="subcat in subcategoriasParaFiltro" :key="subcat.IdSubCategoria" :value="subcat.IdSubCategoria">{{ subcat.Nombre }}</option>
          </select>
        </div>

        <!-- Presentation Filter -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Package class="h-4 w-4 text-orange-500" />
            Presentación o Producto
          </label>
          <select :value="selec" @change="$emit('update:selec', $event.target.value)" class="w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700">
            <option value="Producto">Producto</option>
             <option value="Presentacion" >Presentacion</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Store, Tag, Package, Plus, FileText } from 'lucide-vue-next';

defineProps({
  searchQuery: String,
  TIeneSucursal: Boolean,
  selectedTienda: [String, Number],
  sucursales: Array,
  filtroCategoria: [String, Number],
  categorias: Array,
  filtroSubcategoria: [String, Number],
  subcategoriasParaFiltro: Array,
  selec: String,
});
defineEmits([
  'update:searchQuery',
  'update:selectedTienda',
  'update:filtroCategoria',
  'update:filtroSubcategoria',
  'update:selec',
  'open-add-modal',
  'export-pdf',
]);
</script>