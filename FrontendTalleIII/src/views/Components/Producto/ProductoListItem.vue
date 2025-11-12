<template>
  <div 
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
  >
    <!-- Product Image -->
    <div class="relative h-48 overflow-hidden">
      <img 
        :src="producto?.Producto?.Imagen?.Url || '/placeholder.svg?height=200&width=300'" 
        :alt="producto?.Producto?.Descripcion"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      
      <!-- Status Badge -->
      <div class="absolute top-4 left-4">
        <span :class="[
          'px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm',
          producto.Producto.Estado === 1 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        ]">
          {{ producto.Producto.Estado === 1 ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <!-- Camera Button -->
      <button @click="$emit('open-photo-modal', producto)" class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-orange-600 p-2 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group/btn">
        <Camera class="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
      </button>

      <!-- Price Tag -->
      <div class="absolute bottom-4 left-4">
        <span class="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
          {{ pp[producto.Producto.IdProducto]?.Precio || 0 }} Bs
        </span>
         <span class="bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
          {{ pp[producto.Producto.IdProducto]?.PrecioMayor || 0 }} Bs
        </span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-6">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{{ producto?.Producto.Nombre }}</h3>
        <p class="text-gray-600 text-sm line-clamp-2">{{ producto?.Producto.Descripcion }}</p>
        <p class="text-gray-500 text-xs mt-1">Categoría: {{ producto?.Producto.Subcategoria.Categoria.Nombre }}</p>
        <p class="text-gray-500 text-xs mt-1">Subcategoría: {{ producto?.Producto.Subcategoria.Nombre}}</p>
      </div>

      <!-- Stock Info  -->
      <div class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 mb-2">
            <Package class="h-4 w-4 text-blue-600" />
            <span class="text-sm font-semibold text-blue-700">Stock Disponible</span>
          </div>
          <button @click="$emit('toggle-details', producto.Producto.IdProducto)" class="text-blue-600 hover:text-blue-800">
            <ChevronDown :class="{'rotate-180': expandedProducts[producto.Producto.IdProducto]}" class="h-5 w-5 transition-transform" />
          </button>
        </div>
        <p class="text-lg font-bold text-gray-800"> {{producto.Cantidad }} Unidades</p>
      </div>

      <!-- Collapsible Details -->
      <transition name="fade">
        <div v-if="expandedProducts[producto.Producto.IdProducto]">
          <!-- Paquetes Info -->
          <div class="mb-4 p-3 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-2xl">
            <div class="flex items-center gap-2 mb-2">
              <Package class="h-4 w-4 text-cyan-600" />
              <span class="text-sm font-semibold text-cyan-700">Presentaciones</span>
            </div>
            <div v-if="paquetesPorProducto[producto?.Producto?.IdProducto]?.length > 0" class="space-y-2">
              <div v-for="paquete in paquetesPorProducto[producto?.Producto?.IdProducto]" :key="paquete.IdPaquete" class="text-xs">
                <p class="font-semibold text-gray-800">{{ paquete?.Nombre }} </p>
                <p class="text-gray-600">
                  Se pueden armar <span class="font-bold text-cyan-700">{{ calcularPaquetesPosibles(producto.IdProductoSucursal,producto?.Producto?.IdProducto,paquete.IdPaquete) }}</span>.
                </p>
              </div>
            </div>
            <div v-else>
              <p class="text-sm text-gray-500">No incluido en paquetes.</p>
            </div>
          </div>

          <!-- Promotions Info -->
          <div class="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <div class="flex items-center gap-2 mb-2">
              <Tag class="h-4 w-4 text-purple-600" />
              <span class="text-sm font-semibold text-purple-700">Promociones Disponibles</span>
            </div>
            <div v-if="getPromocionesParaProducto(producto.Producto.IdProducto).length > 0" class="space-y-2">
              <div v-for="promo in getPromocionesParaProducto(producto.Producto.IdProducto)" :key="promo.IdPromocion" class="text-xs">
                <p class="font-semibold text-gray-800">{{ promo.Nombre }}</p>
                <p class="text-gray-600">
                  Se pueden armar <span class="font-bold text-purple-700">{{ promocionesPosiblesCalculadas[producto.Producto.IdProducto]?.[promo.IdPromocion] || 0 }}</span>.
                </p>
              </div>
            </div>
            <div v-else>
              <p class="text-sm text-gray-500">No incluido en promociones.</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Quantity Controls (if specific store selected) -->
      <div v-if="selectedTienda !== 'TODOS'" class="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
        <div class="flex items-center gap-2 mb-3">
          <Store class="h-4 w-4 text-green-600" />
          <span class="text-sm font-semibold text-green-700">Ajustar Stock</span>
        </div>
        <div class="flex items-center justify-center gap-2">
          <button 
            @click="$emit('update-cantidad-producto-en-tienda', producto, - 1)" 
            :disabled="producto?.Cantidad <= 0"
            class="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            <Minus class="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>
          
          <input 
            type="number" 
            :value="producto.Cantidad"
            @change="e => $emit('update-cantidad-producto', producto, Number(e.target.value))"
            class="w-16 h-10 text-center border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
          />
          
          <button 
            @click="$emit('update-cantidad-producto-en-tienda', producto, + 1)"
            class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group/btn"
          >
            <Plus class="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200/80">
          <button @click="$emit('open-edit-modal', producto)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Edit class="h-4 w-4" />
              <span>Editar</span>
          </button>
          <div class="flex items-center gap-2">
              <button @click="$emit('open-ingrediente-modal', producto)" class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center" title="Ingredientes">
                  <Plus class="h-4 w-4" />
              </button>
              <button @click="$emit('open-presentations-modal-from-list', producto)" class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center" title="Presentaciones">
                  <Package class="h-4 w-4" />
              </button>
              <button @click="$emit('abrir-modal-activar-desactivar', producto)" :class="[
                  'rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1',
                  producto.Producto.Estado === 1
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              ]" :title="producto.Producto.Estado === 1 ? 'Desactivar' : 'Activar'">
                  <Trash2 v-if="producto.Producto.Estado === 1" class="h-4 w-4" />
                  <RotateCcw v-else class="h-4 w-4" />
              </button>
          </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Package, Plus, Search, Filter, Edit, Trash2, RotateCcw, Store, Camera,
  Minus, X, Save, AlertTriangle, CheckCircle, Check, ChevronLeft, ChevronRight,
  FileText, Type, Tag, DollarSign, ImageIcon, Info, Hash, Ruler, ChevronDown, AlertCircle } from 'lucide-vue-next';

defineProps({
  producto: Object,
  pp: Object,
  expandedProducts: Object,
  paquetesPorProducto: Object,
  calcularPaquetesPosibles: Function,
  getPromocionesParaProducto: Function,
  promocionesPosiblesCalculadas: Object,
  selectedTienda: [String, Number],
});
defineEmits([
  'open-photo-modal',
  'toggle-details',
  'update-cantidad-producto-en-tienda',
  'update-cantidad-producto',
  'open-edit-modal',
  'open-ingrediente-modal',
  'open-presentations-modal-from-list',
  'abrir-modal-activar-desactivar',
]);
</script>