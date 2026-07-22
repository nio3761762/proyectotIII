<template>
  <div class="flex flex-wrap gap-3 items-end">
    <!-- Búsqueda -->
    <div class="flex-1 min-w-[200px]">
      <label class="text-xs font-semibold text-gray-500 mb-1 block">Buscar Producto</label>
      <div class="relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          placeholder="Buscar por el nombre del producto..."
          class="w-full pl-9 pr-4 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 placeholder:text-gray-400 outline-none text-sm shadow-inner"
        />
      </div>
    </div>

    <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

    <!-- Sucursal -->
    <div v-if="sucursales.length > 0" class="min-w-[150px]">
      <label class="text-xs font-semibold text-gray-500 mb-1 block">Sucursal</label>
      <select
        :value="sucursal"
        :disabled="disableSucursal"
        @change="$emit('update:sucursal', $event.target.value)"
        :class="[
          'w-full py-2.5 px-3 border-0 shadow-sm rounded-2xl text-sm text-gray-700 outline-none transition-all',
          disableSucursal ? 'bg-gray-200/50 cursor-not-allowed opacity-70' : 'bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer'
        ]"
      >
        <option v-if="isAdmin" value="TODOS">Todas las sucursales</option>
        <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
      </select>
    </div>

    <!-- Categoría -->
    <div class="min-w-[150px]">
      <label class="text-xs font-semibold text-gray-500 mb-1 block">Categoría</label>
      <select
        :value="categoria"
        @change="handleCategoriaChange($event.target.value)"
        class="w-full py-2.5 px-3 border-0 shadow-sm bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
      > 
        <option value="TODOS">Todas las categorías</option>
        <option v-for="c in categorias" :key="c.idcategoria" :value="c.idcategoria">{{ c.nombre }}</option>
      </select>
    </div>

    <!-- Subcategoría -->
    <Transition name="slide-down">
      <div v-if="categoria !== 'TODOS'" class="min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Subcategoría</label>
        <select
          :value="subcategoria"
          @change="$emit('update:subcategoria', $event.target.value)"
          class="w-full py-2.5 px-3 border-0 shadow-sm bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
        >
          <option value="TODOS">Todas las subcategorías</option>
          <option v-for="s in internalSubcategorias" :key="s.idsubcategoria" :value="s.idsubcategoria">{{ s.nombre }}</option>
        </select>
      </div>
    </Transition>

    <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

    <!-- Por página -->
    <div>
      <label class="text-xs font-semibold text-gray-500 mb-1 block">Mostrar</label>
      <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 shadow-inner">
        <button
          v-for="op in limiteOpciones" :key="op"
          @click="$emit('update:limite', op)"
          :class="['min-w-[36px] px-2.5 py-1.5 text-sm font-medium rounded-xl transition-all',
            limite === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
        >{{ op }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Search } from 'lucide-vue-next';
import { ObtenerSubCategorias } from '@/Server/Categoria';

const props = defineProps({
  search:       { type: String, default: ''   },
  sucursal:     { type: String, default: 'TODOS' },
  sucursales:   { type: Array,  default: () => [] },
  categoria:    { type: String, default: 'TODOS' },
  subcategoria: { type: String, default: 'TODOS' },
  limite:       { type: Number, default: 12    },
  categorias:   { type: Array,  default: () => [] },
  isAdmin:      { type: Boolean, default: false },
  disableSucursal: { type: Boolean, default: false }
});

const emit = defineEmits([
  'update:search', 'update:sucursal', 'update:categoria', 'update:subcategoria', 'update:limite',
]);

const internalSubcategorias = ref([]);
const limiteOpciones = [8, 12, 20, 50];

const fetchSubcategorias = async (catId) => {
  if (!catId || catId === 'TODOS') {
    internalSubcategorias.value = [];
    return;
  }
  try {
    const res = await ObtenerSubCategorias(catId);
    internalSubcategorias.value = res.result || res || [];
  } catch (e) {
    console.error('Error al cargar subcategorías:', e);
    internalSubcategorias.value = [];
  }
};

const handleCategoriaChange = (val) => {
  emit('update:categoria', val);
  emit('update:subcategoria', 'TODOS');
  fetchSubcategorias(val);
};

onMounted(() => {
  if (props.categoria !== 'TODOS') {
    fetchSubcategorias(props.categoria);
  }
});

watch(() => props.categoria, (newVal) => {
  if (newVal !== 'TODOS') {
    fetchSubcategorias(newVal);
  } else {
    internalSubcategorias.value = [];
  }
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-6px); }
</style>
