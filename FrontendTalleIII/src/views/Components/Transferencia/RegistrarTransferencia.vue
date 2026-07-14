<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <ArrowRightLeft class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Registrar Transferencia
            </h1>
            <p class="text-gray-600 text-sm">Transfiere productos e insumos entre sucursales o a empleados</p>
          </div>
        </div>
        
        <button
          @click="$emit('cancel')"
          class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Columna Izquierda: Configuración e Items -->
      <div class="space-y-6">
        <!-- Configuración Section -->
        <div class="relative z-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Settings2 class="h-6 w-6 text-orange-500" />
            Configuración de Destino
          </h3>

          <div class="space-y-6">
            <!-- Sucursal Origen -->
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Sucursal Origen</label>
              <select 
                v-model="selectedSucursalId"
                @change="onSucursalOrigenChange"
                :disabled="sucursalFija"
                class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="" disabled>Seleccionar sucursal origen</option>
                <option 
                  v-for="suc in sucursalesDisponibles" 
                  :key="suc.idsucursal" 
                  :value="suc.idsucursal"
                >
                  {{ suc.nombre }}
                </option>
              </select>
            </div>

            <!-- Tipo de Transferencia -->
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-3 block">Tipo de Destino</label>
              <div class="grid grid-cols-2 gap-4">
                <button 
                  @click="cambiarTipo('SUCURSAL')"
                  :class="[
                    'py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold',
                    tipoDestino === 'SUCURSAL' 
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-orange-200'
                  ]"
                >
                  <Building2 class="h-6 w-6" />
                  <span>Sucursal</span>
                </button>
                <button 
                  @click="cambiarTipo('EMPLEADO')"
                  :class="[
                    'py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold',
                    tipoDestino === 'EMPLEADO' 
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-orange-200'
                  ]"
                >
                  <User class="h-6 w-6" />
                  <span>Empleado</span>
                </button>
              </div>
            </div>

            <!-- Selector de Destino -->
            <div class="relative">
              <label class="text-sm font-semibold text-gray-700 mb-2 block">
                {{ tipoDestino === 'SUCURSAL' ? 'Seleccionar Sucursal Destino' : 'Seleccionar Empleado Destino' }}
              </label>
              
              <div v-if="tipoDestino === 'SUCURSAL'">
                <select 
                  v-model="sucursalDestino"
                  class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  <option :value="null" disabled>Seleccione una sucursal</option>
                  <option 
                    v-for="suc in sucursalesDisponibles" 
                    :key="suc.idsucursal" 
                    :value="suc"
                    :disabled="suc.idsucursal === selectedSucursalId"
                  >
                    {{ suc.nombre }} {{ suc.idsucursal === selectedSucursalId ? '(Origen)' : '' }}
                  </option>
                </select>
              </div>

              <div v-else>
                 <Combobox v-model="empleadoDestino">
                  <div class="relative mt-1">
                    <div class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                      <ComboboxInput
                        class="w-full border-none outline-none ring-0 focus:ring-0 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                        :displayValue="(emp) => emp ? `${emp.nombre} ${emp.apellidopaterno}` : ''"
                        @change="queryEmpleado = $event.target.value"
                        placeholder="Buscar empleado..."
                      />
                      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </ComboboxButton>
                    </div>
                    <TransitionRoot
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      @after-leave="queryEmpleado = ''"
                    >
                      <ComboboxOptions class="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-lg border max-h-60 overflow-auto">
                        <div v-if="filteredEmpleados.length === 0 && queryEmpleado !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                          No se encontraron empleados.
                        </div>
                        <ComboboxOption
                          v-for="emp in filteredEmpleados"
                          :key="emp.idempleado"
                          :value="emp"
                          v-slot="{ selected, active }"
                        >
                          <li :class="{
                            'bg-orange-500 text-white': active,
                            'text-gray-900': !active,
                            'relative cursor-default select-none py-3 pl-10 pr-4': true,
                          }">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs overflow-hidden">
                                <img v-if="emp.imagen" :src="emp.imagen" class="w-full h-full object-cover" />
                                <span v-else>{{ emp.nombre?.charAt(0) }}</span>
                              </div>
                              <div class="flex flex-col">
                                <span class="font-medium">{{ emp.nombre }} {{ emp.apellidopaterno }}</span>
                                <span class="text-xs opacity-70">{{ emp.cargo }}</span>
                              </div>
                            </div>
                          </li>
                        </ComboboxOption>
                      </ComboboxOptions>
                    </TransitionRoot>
                  </div>
                </Combobox>
              </div>
            </div>
          </div>
        </div>

        <!-- Catálogo de Ítems -->
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Catálogo de Ítems
            </h3>
            
            <div class="flex bg-gray-100 p-1 rounded-xl">
              <button 
                @click="cambiarTab('productos')"
                :class="['px-4 py-2 rounded-lg text-sm font-bold transition-all', activeTab === 'productos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500']"
              >
                Productos
              </button>
              <button 
                v-if="tipoDestino === 'SUCURSAL'"
                @click="cambiarTab('insumos')"
                :class="['px-4 py-2 rounded-lg text-sm font-bold transition-all', activeTab === 'insumos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500']"
              >
                Insumos
              </button>
            </div>
          </div>

          <!-- Filtros y Buscador -->
          <div class="space-y-4 mb-6">
            <div v-if="activeTab === 'productos'">
              <FiltrosProducto
                v-model:search="filtroNombre"
                v-model:categoria="filtroCategoria"
                v-model:subcategoria="filtroSubcategoria"
                v-model:limite="paginacionProd.limite"
                :categorias="categorias"
                @update:limite="(val) => { paginacionProd.limite = val; paginacionProd.paginaActual = 1; fetchItems(); }"
                @update:categoria="() => { paginacionProd.paginaActual = 1; fetchItems(); }"
                @update:subcategoria="() => { paginacionProd.paginaActual = 1; fetchItems(); }"
                @update:search="() => { paginacionProd.paginaActual = 1; fetchItems(); }"
              />
            </div>
            
            <div v-else class="flex flex-col md:flex-row items-center gap-4 w-full">
              <div class="relative flex-1">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  v-model="filtroNombre"
                  @input="() => { paginacionIns.paginaActual = 1; fetchItems(); }"
                  type="text" 
                  placeholder="Buscar insumo por nombre..."
                  class="w-full pl-12 pr-4 py-3 bg-white/60 border border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                />
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-400 uppercase">Ver:</span>
                <div class="flex bg-gray-100 p-1 rounded-2xl">
                  <button 
                    v-for="lim in [8, 12, 24, 48]" 
                    :key="lim"
                    @click="paginacionIns.limite = lim; paginacionIns.paginaActual = 1; fetchItems();"
                    :class="['px-3 py-1 rounded-xl text-xs font-bold transition-all', paginacionIns.limite === lim ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                  >
                    {{ lim }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Grid de Items -->
          <div class="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-if="loadingItems" class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            
            <div v-else>
              <!-- Productos -->
              <div v-show="activeTab === 'productos'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Productocard 
                  v-for="prod in productosConStockReal" 
                  :key="prod.idproducto || prod.IdProducto"
                  :producto="prod"
                  :medidas="prod.medidas || []"
                  @select-medida="agregarProducto"
                />
              </div>

              <!-- Insumos -->
              <div v-show="activeTab === 'insumos'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InsumoCard 
                  v-for="insumo in insumosConStockReal" 
                  :key="insumo.IdInsumo"
                  :insumo="insumo"
                  @select="agregarInsumo"
                />
              </div>

              <div v-if="(activeTab === 'productos' && productos.length === 0) || (activeTab === 'insumos' && insumos.length === 0)" 
                class="text-center py-10 text-gray-400 font-medium">
                No se encontraron items.
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div class="pt-6 border-t border-gray-100 mt-6">
            <Paginado
              v-if="activeTab === 'productos' && paginacionProd.totalPaginas >= 1"
              :paginaActual="paginacionProd.paginaActual"
              :totalPaginas="paginacionProd.totalPaginas"
              :total="paginacionProd.total"
              :limite="paginacionProd.limite"
              @update:paginaActual="(p) => { paginacionProd.paginaActual = p; fetchItems(); }"
            />
            <Paginado
              v-else-if="activeTab === 'insumos' && paginacionIns.totalPaginas >= 1"
              :paginaActual="paginacionIns.paginaActual"
              :totalPaginas="paginacionIns.totalPaginas"
              :total="paginacionIns.total"
              :limite="paginacionIns.limite"
              @update:paginaActual="(p) => { paginacionIns.paginaActual = p; fetchItems(); }"
            />
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Carrito y Resumen -->
      <div class="space-y-6">
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sticky top-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart class="h-6 w-6 text-orange-500" />
              Items a Transferir
            </h3>
            <span class="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
              {{ totalItems }} Items
            </span>
          </div>

          <!-- Lista de Items en el Carrito -->
          <div class="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <PackageOpen class="h-12 w-12 mb-2 opacity-20" />
              <p class="font-medium">No hay items seleccionados</p>
            </div>

            <TransitionGroup name="list" tag="div" class="space-y-3">
              <div v-for="(item, index) in carrito" :key="item.idUnico" 
                class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-orange-200 transition-all">
                
                <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img v-if="item.imagen" :src="item.imagen" class="w-full h-full object-cover" />
                  <Package v-else class="h-6 w-6 text-gray-300" />
                </div>

                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-800 text-sm truncate">{{ item.nombre }}</h4>
                  <p class="text-xs text-gray-500">
                    {{ item.esInsumo ? 'Insumo' : (item.presentacion || 'Producto') }}
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex items-center bg-gray-50 rounded-xl px-2 py-1">
                    <button @click="actualizarCantidad(index, -1)" class="p-1 hover:text-orange-600 transition-colors">
                      <Minus class="h-3 w-3" />
                    </button>
                    <input 
                      type="number" 
                      :value="item.cantidad"
                      @change="onDirectQtyChange(index, $event.target.value)"
                      class="w-12 text-center font-bold text-sm text-orange-700 bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button @click="actualizarCantidad(index, 1)" class="p-1 hover:text-orange-600 transition-colors">
                      <Plus class="h-3 w-3" />
                    </button>
                  </div>
                  
                  <button @click="eliminarDelCarrito(index)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- Resumen y Acción Final -->
          <div class="space-y-4 pt-6 border-t border-gray-100">
            <div class="bg-gray-50 rounded-2xl p-4 space-y-3 font-semibold">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total Productos</span>
                <span class="text-gray-800">{{ totalProductos }}</span>
              </div>
              <div v-if="tipoDestino === 'SUCURSAL'" class="flex justify-between text-sm">
                <span class="text-gray-500">Total Insumos</span>
                <span class="text-gray-800">{{ totalInsumos }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-200">
                <span class="text-gray-800">Total Items</span>
                <span class="text-orange-600 font-black text-lg">{{ totalItems }}</span>
              </div>
            </div>

            <div class="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start">
              <Info class="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p class="text-xs text-orange-700 leading-relaxed">
                Asegúrate de que el destino sea correcto. Las transferencias descuentan stock automáticamente de la sucursal origen.
              </p>
            </div>

            <div class="flex gap-4">
              <button 
                @click="$emit('cancel')" 
                class="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                @click="procesarTransferencia"
                :disabled="!esValido || enviando"
                class="flex-2 py-4 rounded-2xl bg-linear-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:grayscale disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                <div v-if="enviando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <Send v-else class="h-5 w-5" />
                <span>{{ enviando ? 'Registrando...' : 'Confirmar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Local Notifications for the form -->
    <div v-if="localNotification" class="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div :class="['px-6 py-4 rounded-2xl shadow-xl text-white font-bold flex items-center gap-3', localNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <CheckCircle v-if="localNotification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ localNotification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { 
  ArrowRightLeft, X, Settings2, Building2, User, Package, 
  Search, ShoppingCart, Trash2, Plus, Minus, Send, Info,
  PackageOpen, CheckCircle, AlertTriangle
} from 'lucide-vue-next';
import { 
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, 
  ComboboxOption, TransitionRoot 
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

// Services
import { Listsucursal } from '@/Server/Sucural';
import { SucursalUsuario } from '@/Server/Usuario';
import { getEmpleadosVendedores } from '@/Server/Empleado';
import { ListarProductosOnSucursal } from '@/Server/Producto';
import { getInsumosSucursal } from '@/Server/Produccion';
import { registrarTransferencia } from '@/Server/Transferencia';
import { listCategorias } from '@/Server/Categoria';

// Components
import Productocard from '../Venta/Productocard.vue';
import InsumoCard from './InsumoCard.vue';
import FiltrosProducto from '../Venta/FiltrosProducto.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';

const props = defineProps({
  sucursalId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['cancel', 'success']);

// State
const tipoDestino = ref('SUCURSAL');
const sucursalDestino = ref(null);
const empleadoDestino = ref(null);
const queryEmpleado = ref('');
const activeTab = ref('productos');
const filtroNombre = ref('');
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const carrito = ref([]);
const enviando = ref(false);
const loadingItems = ref(false);
const localNotification = ref(null);
const currentUserId = ref(null);
const selectedSucursalId = ref('');
const sucursalFija = ref(false);

// Paginacion logic like Venta.vue
const paginacionProd = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });
const paginacionIns = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });

// Datos Maestros
const sucursalesDisponibles = ref([]);
const empleadosDisponibles = ref([]);
const categorias = ref([]);
const productos = ref([]);
const insumos = ref([]);

let debounceTimer = null;

// Computed
const filteredEmpleados = computed(() => {
  if (queryEmpleado.value === '') return empleadosDisponibles.value;
  return empleadosDisponibles.value.filter(emp => {
    const nombreCompleto = `${emp.Persona?.Nombre || ''} ${emp.Persona?.ApellidoPaterno || ''}`.toLowerCase();
    return nombreCompleto.includes(queryEmpleado.value.toLowerCase());
  });
});

const totalItems = computed(() => carrito.value.reduce((acc, item) => acc + item.cantidad, 0));
const totalProductos = computed(() => carrito.value.filter(i => !i.esInsumo).reduce((acc, item) => acc + item.cantidad, 0));
const totalInsumos = computed(() => carrito.value.filter(i => i.esInsumo).reduce((acc, item) => acc + item.cantidad, 0));

const esValido = computed(() => {
  const tieneDestino = tipoDestino.value === 'SUCURSAL' ? !!sucursalDestino.value : !!empleadoDestino.value;
  return tieneDestino && carrito.value.length > 0;
});

// Methods
const showNotification = (message, type = 'success') => {
  localNotification.value = { message, type };
  setTimeout(() => localNotification.value = null, 3000);
};

const fetchItems = async () => {
  if (!selectedSucursalId.value) return;
  loadingItems.value = true;
  try {
    if (activeTab.value === 'productos') {
      const res = await ListarProductosOnSucursal(
        selectedSucursalId.value,
        filtroNombre.value,
        paginacionProd.limite,
        paginacionProd.paginaActual,
        filtroCategoria.value === 'TODOS' ? '' : filtroCategoria.value,
        filtroSubcategoria.value === 'TODOS' ? '' : filtroSubcategoria.value
      );
      productos.value = res.result || res.data || [];
      paginacionProd.total = parseInt(res.total) || productos.value.length;
      paginacionProd.totalPaginas = Math.ceil(paginacionProd.total / paginacionProd.limite) || 1;
    } else if (activeTab.value === 'insumos') {
      const res = await getInsumosSucursal(
        selectedSucursalId.value,
        filtroNombre.value,
        paginacionIns.limite,
        paginacionIns.paginaActual
      );
      
      const rawInsumos = res.data || [];
      
      // Agrupar y sumar stock para evitar duplicados por ID (si el backend aún devuelve duplicados por lote/medida)
      const groupedInsumos = rawInsumos.reduce((acc, item) => {
        const id = item.IdInsumo || item.idinsumo;
        if (!acc[id]) {
          acc[id] = { ...item, StockGramos: 0 };
        }
        acc[id].StockGramos += parseFloat(item.StockGramos || 0);
        return acc;
      }, {});

      insumos.value = Object.values(groupedInsumos);
      paginacionIns.total = parseInt(res.total) || insumos.value.length;
      paginacionIns.totalPaginas = parseInt(res.totalPages) || Math.ceil(paginacionIns.total / paginacionIns.limite) || 1;
    }
  } catch (error) {
    console.error('Error fetching items:', error);
  } finally {
    loadingItems.value = false;
  }
};

const onSucursalOrigenChange = () => {
  sucursalDestino.value = null;
  carrito.value = [];
  fetchItems();
};

const cargarDatosBase = async () => {
  try {
    const [suc, emp, cat] = await Promise.all([
      Listsucursal(),
      getEmpleadosVendedores(),
      listCategorias()
    ]);
    sucursalesDisponibles.value = suc.result || suc || [];
    empleadosDisponibles.value =emp.result || emp || [];
    categorias.value = cat.result || cat || [];
  } catch (error) {
    showNotification('Error al cargar datos maestros', 'error');
  }
};

const cambiarTab = (tab) => {
  activeTab.value = tab;
  fetchItems();
};

const onLimiteChange = (limite) => {
  if (activeTab.value === 'productos') {
    paginacionProd.limite = limite;
    paginacionProd.paginaActual = 1;
  } else {
    paginacionIns.limite = limite;
    paginacionIns.paginaActual = 1;
  }
  fetchItems();
};

const cambiarTipo = (tipo) => {
  tipoDestino.value = tipo;
  sucursalDestino.value = null;
  empleadoDestino.value = null;
  if (tipo === 'EMPLEADO') {
    activeTab.value = 'productos';
    carrito.value = carrito.value.filter(item => !item.esInsumo);
  }
};

// --- HELPERS ---
const getProdId = (obj) => obj?.idproducto || obj?.IdProducto;
const getPaqueteId = (obj) => obj?.idproductomedida || obj?.idPaquete || obj?.IdPaquete;

// --- STOCK LOGIC (Pattern from Venta.vue) ---

const productosConStockReal = computed(() => {
  return productos.value.map(p => {
    const productId = getProdId(p);
    
    // Descontar lo que ya está en el carrito para este producto base
    const usadoEnCarrito = carrito.value
      .filter(i => !i.esInsumo && i.idBase === productId)
      .reduce((acc, i) => acc + (i.cantidad * (parseFloat(i.multiplicador) || 1)), 0);
    
    return {
      ...p,
      // Usamos 'cantidad' porque Productocard.vue lee esa propiedad para el stock
      cantidad: Math.max(0, (parseFloat(p.stock) || parseFloat(p.cantidad) || 0) - usadoEnCarrito)
    };
  });
});

const insumosConStockReal = computed(() => {
  return insumos.value.map(ins => {
    const insumoId = ins.IdInsumo || ins.idinsumo;
    
    // Descontar lo que ya está en el carrito para este insumo (en gramos)
    const usadoEnCarritoGramos = carrito.value
      .filter(i => i.esInsumo && i.idInsumoBase === insumoId)
      .reduce((acc, i) => acc + (i.cantidad * (parseFloat(i.multiplicador) || 1)), 0);
      
    return {
      ...ins,
      // InsumoCard.vue usa 'StockGramos' para sus cálculos
      StockGramos: Math.max(0, (parseFloat(ins.StockGramos) || 0) - usadoEnCarritoGramos)
    };
  });
});

const onDirectQtyChange = (index, val) => {
  const item = carrito.value[index];
  const newQty = parseInt(val) || 1;
  const delta = newQty - item.cantidad;

  if (delta === 0) return;
  if (newQty <= 0) { eliminarDelCarrito(index); return; }

  if (delta > 0) {
    if (!item.esInsumo) {
      const productInStock = productosConStockReal.value.find(p => getProdId(p) === item.idBase);
      if (delta * (parseFloat(item.multiplicador) || 1) > productInStock.cantidad) {
        showNotification('Stock insuficiente', 'error');
        return;
      }
    } else {
      const insumoInStock = insumosConStockReal.value.find(i => (i.IdInsumo || i.idinsumo) === item.idInsumoBase);
      // Validar si el incremento cabe en el stock de gramos restante
      if (delta * (parseFloat(item.multiplicador) || 1) > insumoInStock.StockGramos) {
        showNotification('Stock insuficiente', 'error');
        return;
      }
    }
  }
  item.cantidad = newQty;
};

// --- EVENT HANDLERS ---

const agregarProducto = ({ producto, medida }) => {
  const productId = getProdId(producto);
  const productData = productosConStockReal.value.find(p => getProdId(p) === productId);
  const multiplicador = parseFloat(medida.cantidad || medida.Cantidad) || 1;

  if (multiplicador > productData.cantidad) {
    showNotification(`Stock insuficiente`, 'error');
    return;
  }

  const paqueteId = getPaqueteId(medida);
  const existing = carrito.value.find(i => !i.esInsumo && i.idPaquete === paqueteId);
  
  if (existing) { 
    existing.cantidad++; 
  } else {
    carrito.value.push({
      idUnico: `prod-${paqueteId}`,
      idBase: productId,
      idPaquete: paqueteId,
      nombre: producto.nombre || producto.Nombre,
      presentacion: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre,
      imagen: producto.imagen || producto.Imagen,
      cantidad: 1,
      multiplicador: multiplicador,
      esInsumo: false
    });
  }
  showNotification('Producto agregado', 'success');
};

const agregarInsumo = (item) => {
  const { medida, cantidad } = item;
  const insumoId = item.IdInsumo || item.idinsumo;
  const insumoData = insumosConStockReal.value.find(i => (i.IdInsumo || i.idinsumo) === insumoId);
  
  // Factor real en gramos: factor base * cantidad de la medida
  const factor = parseFloat(medida.cantidad || 1) * parseFloat(medida.cantidadmedida || 1);
  const requerimientoGramos = cantidad * factor;

  if (requerimientoGramos > insumoData.StockGramos) {
    showNotification(`Stock insuficiente`, 'error');
    return;
  }

  const medidaId = medida.idinsumomedida;
  const existing = carrito.value.find(i => i.esInsumo && i.idInsumoMedida === medidaId);
  
  if (existing) {
    existing.cantidad += cantidad;
  } else {
    carrito.value.push({
      idUnico: `ins-${medidaId}`,
      idInsumoBase: insumoId,
      idInsumoMedida: medidaId,
      idInsumo: medidaId, // Para compatibilidad con el objeto detalles
      nombre: item.Nombre,
      imagen: item.Imagen,
      cantidad: cantidad,
      multiplicador: factor,
      esInsumo: true,
      presentacion: medida.unidad_nombre
    });
  }
  showNotification('Insumo agregado', 'success');
};

const actualizarCantidad = (index, delta) => {
  const item = carrito.value[index];
  onDirectQtyChange(index, item.cantidad + delta);
};

const eliminarDelCarrito = (index) => {
  carrito.value.splice(index, 1);
};

const procesarTransferencia = async () => {
  if (!esValido.value) return;
  
  enviando.value = true;
  try {
    const dataTransferencia = {
      IdUsuario: currentUserId.value,
      IdSucursal: selectedSucursalId.value,
      Tipo: tipoDestino.value,
      IdsucursalOrigen: selectedSucursalId.value,
      IdsucursalDestino: sucursalDestino.value?.idsucursal || null,
      IdempleadoDestino: empleadoDestino.value?.idempleado || null
    };

    const detalles = {
      Producto: carrito.value.map(item => ({
        idPaquete: item.idPaquete,
        idInsumo: item.idInsumo,
        Cantidad: item.cantidad
      }))
    };

    await registrarTransferencia(dataTransferencia, detalles);
    emit('success');
  } catch (error) {
    showNotification(error.response?.data?.message || 'Error al registrar transferencia', 'error');
  } finally {
    enviando.value = false;
  }
};

// Watcher for search and category
watch([filtroNombre, filtroCategoria, filtroSubcategoria], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    paginacionProd.paginaActual = 1;
    paginacionIns.paginaActual = 1;
    fetchItems();
  }, 400);
});

onMounted(async () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    const u = JSON.parse(usuarioStr);
    currentUserId.value = u.IdUsuario;

    // Try to get user's branch
    try {
      const sucResp = await SucursalUsuario(u.IdUsuario);
      if (sucResp?.idsucursal) {
        selectedSucursalId.value = sucResp.idsucursal;
        sucursalFija.value = true;
      }
    } catch (e) { console.error(e); }
  }
  await cargarDatosBase();
  if (!selectedSucursalId.value && sucursalesDisponibles.value.length > 0) {
    selectedSucursalId.value = sucursalesDisponibles.value[0].idsucursal;
  }
  fetchItems();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

@keyframes slide-in { 
  from { transform: translateX(100%); opacity: 0; } 
  to { transform: translateX(0); opacity: 1; } 
}
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
</style>
