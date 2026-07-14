<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="flex flex-wrap gap-4 items-end">
      
      <!-- Fecha -->
      <div class="flex-1 min-w-[160px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Filtrar por Fecha</label>
        <div 
          class="relative group h-[42px] cursor-pointer"
          @click="openDatePicker"
        >
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-20" />

          <!-- Facade: Muestra la fecha formateada -->
          <input 
            type="text" 
            readonly
            :value="formatearFechaLocal(modelValue.fecha)"
            placeholder="dd/mm/aaaa"
            class="w-full h-full pl-9 pr-4 py-2.5 border-0 bg-gray-50/80 rounded-2xl transition-all text-gray-700 outline-none text-sm shadow-inner cursor-pointer"
          />

          <!-- Native Input: Oculto pero accesible vía ref -->
          <input 
            ref="dateInput" 
            type="date" 
            :value="modelValue.fecha"
            @input="$emit('update:modelValue', { ...modelValue, fecha: $event.target.value })"
            class="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
      </div>

      <!-- Sucursal -->
      <div class="min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Sucursal</label>
        <div class="relative group">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
          <select
            :value="modelValue.sucursal"
            :disabled="disableSucursal"
            @change="$emit('update:modelValue', { ...modelValue, sucursal: $event.target.value })"
            :class="[
              'w-full pl-9 pr-10 py-2.5 border-0 rounded-2xl text-sm text-gray-700 outline-none transition-all shadow-inner appearance-none',
              disableSucursal ? 'bg-gray-200/50 cursor-not-allowed opacity-70' : 'bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer'
            ]"
          >
            <option v-if="isAdmin" value="TODOS">Todas las sucursales</option>
            <option v-for="sucursal in sucursales" :key="sucursal.idsucursal || sucursal.IdSucursal" :value="sucursal.idsucursal || sucursal.IdSucursal">
              {{ sucursal.nombre || sucursal.Nombre }}
            </option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <!-- Producto -->
      <div class="min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Producto</label>
        <div class="relative group">
          <Package class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
          <select 
            :value="modelValue.producto"
            @change="$emit('update:modelValue', { ...modelValue, producto: $event.target.value })"
            class="w-full pl-9 pr-10 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 outline-none text-sm shadow-inner cursor-pointer appearance-none"
          >
            <option value="TODOS">Todos los productos</option>
            <option v-for="prod in productos" :key="prod.idproducto || prod.IdProducto" :value="prod.idproducto || prod.IdProducto">
              {{ prod.nombre || prod.Nombre }}
            </option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <!-- Promoción -->
      <div class="min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Promoción</label>
        <div class="relative group">
          <Tag class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
          <select 
            :value="modelValue.promocion"
            @change="$emit('update:modelValue', { ...modelValue, promocion: $event.target.value })"
            class="w-full pl-9 pr-10 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 outline-none text-sm shadow-inner cursor-pointer appearance-none"
          >
            <option value="TODOS">Todas las promociones</option>
            <option v-for="promo in promociones" :key="promo.idpromocion || promo.IdPromocion" :value="promo.idpromocion || promo.IdPromocion">
              {{ promo.nombre || promo.Nombre }}
            </option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <!-- Método de Pago -->
      <div class="min-w-[160px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Método de Pago</label>
        <div class="relative group">
          <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
          <select
            :value="modelValue.pago"
            @change="$emit('update:modelValue', { ...modelValue, pago: parseInt($event.target.value) })"
            class="w-full pl-9 pr-10 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 outline-none text-sm shadow-inner cursor-pointer appearance-none"
          >
            <option v-for="m in metodosPago" :key="m.IdMetodoPago" :value="m.IdMetodoPago">
              {{ m.Nombre }}
            </option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <!-- Factura -->
      <div class="min-w-[160px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Factura</label>
        <div class="relative group">
          <Receipt class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
          <select
            :value="modelValue.factura"
            @change="$emit('update:modelValue', { ...modelValue, factura: $event.target.value })"
            class="w-full pl-9 pr-10 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 outline-none text-sm shadow-inner cursor-pointer appearance-none"
          >
            <option value="TODOS">Todos</option>
            <option value="SI">Con Factura</option>
            <option value="NO">Sin Factura</option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>
      <div class="hidden lg:block w-px h-10 bg-gray-200 self-end mb-1"></div>

      <!-- Por página -->
      <div>
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Mostrar</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 shadow-inner">
          <button
            v-for="op in [8, 12, 20, 50]" :key="op"
            @click="$emit('update:limit', op)"
            :class="['min-w-[36px] px-2.5 py-1.5 text-sm font-medium rounded-xl transition-all',
              limit === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >{{ op }}</button>
        </div>
      </div>

      <!-- Toggle Vista (Icons Only) -->
      <div class="flex flex-col">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Vista</label>
        <div class="flex bg-gray-100/80 p-1 rounded-2xl shadow-inner gap-1">
          <button 
            @click="$emit('update:viewMode', 'cards')"
            :class="['p-2 rounded-xl transition-all duration-300', viewMode === 'cards' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
            title="Vista en Tarjetas"
          >
            <LayoutGrid class="h-4 w-4" />
          </button>
          <button 
            @click="$emit('update:viewMode', 'tabla')"
            :class="['p-2 rounded-xl transition-all duration-300', viewMode === 'tabla' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
            title="Vista en Tabla"
          >
            <List class="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Calendar, MapPin, Package, Tag, CreditCard, Receipt, ChevronDown, LayoutGrid, List } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  sucursales: {
    type: Array,
    default: () => []
  },
  productos: {
    type: Array,
    default: () => []
  },
  promociones: {
    type: Array,
    default: () => []
  },
  metodosPago: {
    type: Array,
    default: () => []
  },
  tieneSucursalAsignada: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 12
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  disableSucursal: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'cards'
  }
});

defineEmits(['update:modelValue', 'update:limit', 'update:viewMode']);

const dateInput = ref(null);

const openDatePicker = () => {
  if (dateInput.value) {
    try {
      // showPicker() es el método estándar moderno
      dateInput.value.showPicker();
    } catch (e) {
      // Fallback para navegadores más antiguos
      dateInput.value.focus();
      dateInput.value.click();
    }
  }
};

const formatearFechaLocal = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
};
</script>
