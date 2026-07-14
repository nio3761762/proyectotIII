<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
    <div class="flex flex-wrap items-end gap-6">
      <!-- Search -->
      <div class="flex-1 min-w-[250px] space-y-2">
           <label class="text-xs font-semibold text-gray-500 mb-1 block">Buscar</label>
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors pointer-events-none" />
          <input
            v-model="filters.search"
            @input="handleInput"
            type="text"
            placeholder="Proveedor...."
            class="w-full pl-12 pr-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-gray-700 placeholder-gray-400 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <!-- Date -->
      <div class="space-y-2">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Fecha</label>
        <div class="relative group cursor-pointer">
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none z-10" />
          <input
            :value="formatDateForInput(filters.fecha)"
            type="text"
            readonly
            @click="triggerPicker"
            placeholder="dd/mm/yyyy"
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 shadow-sm outline-none text-sm text-gray-700 cursor-pointer"
          />
          <input
            ref="datePicker"
            v-model="filters.fecha"
            @change="emitFilters"
            type="date"
            class="absolute inset-0 opacity-0 invisible pointer-events-none"
          />
        </div>
      </div>

      <!-- Estado -->
      <div class="space-y-2">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Estado</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 border border-gray-200/50">
          <button
            v-for="op in estadoOpciones" :key="op.value"
            @click="setEstado(op.value)"
            type="button"
            :class="['px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2',
              filters.estado === op.value ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            <div :class="['w-2 h-2 rounded-full', op.color]"></div>
            {{ op.label }}
          </button>
        </div>
      </div>

      <!-- Toggle Vista -->
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
            @click="$emit('update:viewMode', 'table')"
            :class="['p-2 rounded-xl transition-all duration-300', viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
            title="Vista en Tabla"
          >
            <List class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Por página -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase ml-1 block">Ver</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 border border-gray-200/50">
          <button
            v-for="op in limiteOpciones" :key="op"
            @click="setLimit(op)"
            type="button"
            :class="['min-w-[40px] px-3 py-2 text-sm font-bold rounded-xl transition-all duration-200',
              filters.limit === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            {{ op }}
          </button>
        </div>
      </div>

      <!-- Nueva Compra Button -->
      <button 
        @click="$emit('add')" 
        type="button"
        class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-orange-200 transition-all duration-300 flex items-center gap-2 group font-bold transform hover:scale-[1.02] active:scale-95 ml-auto"
      >
        <Plus class="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        <span class="hidden sm:inline">Nueva Compra</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { Search, Plus, Calendar, LayoutGrid, List } from 'lucide-vue-next';
import { getLocalDate } from '../../../utils/formatters';

const props = defineProps({
  initialLimit: { type: Number, default: 9 },
  viewMode: { type: String, default: 'cards' }
});

const emit = defineEmits(['filter', 'add', 'update:viewMode']);

const datePicker = ref(null);

const today = getLocalDate();

const filters = reactive({
  search: '',
  fecha: today,
  estado: -1,
  limit: props.initialLimit
});

onMounted(() => {
  emitFilters();
});

const estadoOpciones = [
  { value: -1, label: 'Todos',    color: 'bg-gray-400'  },
  { value: 1,  label: 'Activos',  color: 'bg-green-500' },
  { value: 0,  label: 'Anulados', color: 'bg-red-500'   },
];

const limiteOpciones = [5, 8, 12, 20];

let debounceTimeout = null;

const handleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emitFilters();
  }, 500);
};

const setEstado = (val) => {
  filters.estado = val;
  emitFilters();
};

const setLimit = (val) => {
  filters.limit = val;
  emitFilters();
};

const triggerPicker = () => {
  datePicker.value.showPicker();
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const emitFilters = () => {
  emit('filter', { ...filters });
};


</script>
