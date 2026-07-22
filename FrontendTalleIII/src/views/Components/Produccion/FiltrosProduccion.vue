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
            placeholder="Buscar producción..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-gray-700 placeholder-gray-400 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <!-- Sucursal Searchable -->
      <div class="space-y-2 min-w-[250px] relative">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Sucursal</label>
        <div class="relative">
          <Building2 class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none z-10" />
          
          <button 
            ref="sucursalBtnRef"
            @click="!tieneSucursal && toggleSucursalDropdown()"
            class="w-full pl-12 pr-10 py-3 bg-gray-50/80 border-0 rounded-2xl transition-all duration-300 text-gray-700 outline-none shadow-sm text-sm cursor-pointer flex items-center justify-between"
            :class="{'opacity-70 cursor-not-allowed bg-gray-100': tieneSucursal}"
            type="button"
          >
            <span class="truncate font-medium">{{ selectedSucursalName }}</span>
            <ChevronDown v-if="!tieneSucursal" class="h-4 w-4 text-gray-400 transition-transform duration-300" :class="{'rotate-180': showSucursalDropdown}" />
          </button>

          <Teleport to="body">
            <div v-if="showSucursalDropdown && !tieneSucursal" @click="showSucursalDropdown = false" class="fixed inset-0 z-[9999]" style="background: transparent;"></div>
            <Transition name="fade">
              <div v-if="showSucursalDropdown && !tieneSucursal"
                :style="{ position: 'fixed', top: sucursalDropdownTop + 'px', left: sucursalDropdownLeft + 'px', width: sucursalDropdownWidth + 'px' }"
                class="z-[10000] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div class="p-3 border-b border-gray-50 bg-gray-50/50">
                  <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      v-model="sucursalSearch" 
                      type="text" 
                      placeholder="Buscar sucursal..."
                      class="w-full pl-10 pr-4 py-2 bg-white border-0 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none font-medium"
                      @click.stop
                    />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto custom-scrollbar">
                  <div 
                    @click="selectSucursal('-1')"
                    class="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 flex items-center justify-between"
                    :class="{'text-orange-600 bg-orange-50/50': filters.idsucursal === '-1'}"
                  >
                    <span>Todas las sucursales</span>
                    <Check v-if="filters.idsucursal === '-1'" class="h-4 w-4" />
                  </div>
                  <div 
                    v-for="s in sucursales" 
                    :key="s.idsucursal"
                    @click="selectSucursal(s.idsucursal)"
                    class="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 flex items-center justify-between"
                    :class="{'text-orange-600 bg-orange-50/50': filters.idsucursal === s.idsucursal}"
                  > 
                    <span>{{ s.nombre }}</span> 
                    <Check v-if="filters.idsucursal === s.idsucursal" class="h-4 w-4" />
                  </div>
                  <div v-if="filteredSucursales.length === 0 && sucursalSearch" class="p-6 text-center">
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">No hay resultados</p>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>

      <!-- Dates Group -->
      <div class="flex gap-4">
        <!-- Fecha -->
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
      </div>

      <!-- Por página -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase ml-1 block">Ver</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 border border-gray-200/50">
          <button
            v-for="op in [5, 8, 12, 20]" :key="op"
            @click="setLimit(op)"
            type="button"
            :class="['min-w-[40px] px-3 py-2 text-sm font-bold rounded-xl transition-all duration-200',
              filters.limit === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            {{ op }}
          </button>
        </div>
      </div>

      <!-- Modo de Vista -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase ml-1 block">Vista</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 border border-gray-200/50">
          <button 
            @click="$emit('update:viewMode', 'card')"
            :class="['p-2 rounded-xl transition-all', viewMode === 'card' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700']"
            title="Vista Cuadrícula"
          >
            <LayoutGrid class="h-4 w-4" />
          </button>
          <button 
            @click="$emit('update:viewMode', 'table')"
            :class="['p-2 rounded-xl transition-all', viewMode === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700']"
            title="Vista Tabla"
          >
            <ListIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Nueva Producción Button -->
      <button 
        @click="$emit('add')" 
        type="button"
        :disabled="disableAdd"
        class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-orange-200 transition-all duration-300 flex items-center gap-2 group font-bold transform hover:scale-[1.02] active:scale-95 ml-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Plus class="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        <span class="hidden sm:inline">Nueva Producción</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { Search, Plus, Calendar, Building2, ChevronDown, Check, LayoutGrid, List as ListIcon } from 'lucide-vue-next';
import { getLocalDate } from '../../../utils/formatters';
import { Listsucursal } from '@/Server/Sucural';

const props = defineProps({
  initialLimit: { type: Number, default: 8 },
  disableAdd: { type: Boolean, default: false },
  tieneSucursal: { type: Boolean, default: false },
  initialSucursal: { type: String, default: '-1' },
  viewMode: { type: String, default: 'card' }
});

const emit = defineEmits(['filter', 'add', 'update:viewMode']);

// UI State
const datePicker = ref(null);
const sucursales = ref([]);
const showSucursalDropdown = ref(false);
const sucursalSearch = ref('');
const sucursalBtnRef = ref(null);
const sucursalDropdownTop = ref(0);
const sucursalDropdownLeft = ref(0);
const sucursalDropdownWidth = ref(0);

const toggleSucursalDropdown = () => {
  if (showSucursalDropdown.value) {
    showSucursalDropdown.value = false;
    return;
  }
  const el = sucursalBtnRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  sucursalDropdownTop.value = rect.bottom + 4;
  sucursalDropdownLeft.value = rect.left;
  sucursalDropdownWidth.value = rect.width;
  showSucursalDropdown.value = true;
};

const today = getLocalDate();

const filters = reactive({
  search: '',
  idsucursal: props.initialSucursal,
  fecha: today,
  limit: props.initialLimit
});

// Computed
const filteredSucursales = computed(() => {
  if (!sucursalSearch.value) return sucursales.value;
  const search = sucursalSearch.value.toLowerCase();
  return sucursales.value.filter(s => s.nombre.toLowerCase().includes(search));
});

const selectedSucursalName = computed(() => {
  if (filters.idsucursal === '-1') return 'Todas las sucursales';
  const found = sucursales.value.find(s => s.idsucursal === filters.idsucursal);
  return found ? found.nombre : 'Seleccionar sucursal';
});

// Watch for initialSucursal changes to keep filters in sync
watch(() => props.initialSucursal, (newVal) => {
  if (newVal) {
    filters.idsucursal = newVal;
  }
});

onMounted(async () => {
  try {
    const res = await Listsucursal();
    sucursales.value = Array.isArray(res) ? res : (res.result || []);
  } catch (error) {
    console.error("Error loading sucursales:", error);
  }
  emitFilters();
});

const selectSucursal = (id) => {
  filters.idsucursal = id;
  showSucursalDropdown.value = false;
  sucursalSearch.value = '';
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

let debounceTimeout = null;

const handleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emitFilters();
  }, 500);
};
</script>
