<template>
  <div class="min-h-screen ">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Vista Principal de Compras  -->
    <div v-if="!showRegistration">
      <!-- Header -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Truck class="h-6 w-6 text-white" />
            </div>
            <div> 
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Compras
              </h1>
              <p class="text-gray-600 text-sm">Administra las compras a proveedores</p>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ activeComprasCount }}</div>
                <div class="text-sm text-gray-500">Activas</div>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ totalComprasCount }}</div>
                <div class="text-sm text-gray-500">Total</div>
              </div>
              <div class="p-2 bg-green-100 rounded-xl">
                <TrendingUp class="h-6 w-6 text-green-600" />
              </div>
            </div>
        </div>
      </div>
       <!-- Filters -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
          <!-- Buttons moved here -->
          <div class="flex items-center justify-end gap-4 mb-6 pb-4 border-b border-gray-200">
            
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold">Nueva Compra</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Search -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Search class="h-4 w-4 text-orange-500" />
                Buscar Compra
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar por proveedor o nombre de producto..."
                  class="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <!-- Date Filter -->
            <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar class="h-4 w-4 text-orange-500" />
                    Filtrar por Fecha
                </label>
                <input
                    v-model="dateFilter"
                    type="date"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>
          </div>
      </div>

      <!-- Purchases Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="compra in comprasPaginadas" :key="compra.id" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Compra #{{ compra.IdCompra }}</h3>
                <p class="text-gray-600 text-sm">{{ compra.Proveedor.Persona.Nombre }} {{ compra.Proveedor.Persona.ApellidoPaterno }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', getStatusClass(compra?.Estado?.Nombre)]">
                {{ compra?.Estado?.Nombre }}
              </span>
            </div>
            <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-gray-700">Fecha: {{ formatDate(compra.FechaCompra) }}</span>
                    <button @click="toggleDetalles(compra.IdCompra)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
                      {{ compraExpandida === compra.IdCompra ? 'Ocultar' : 'Ver Detalles' }}
                    </button>
                </div>
            </div>
            <div v-if="compraExpandida === compra.IdCompra" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
                <div v-for="item in compra.Detallecompra" :key="item.IdDetalleCompra" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                    <p class="font-semibold text-gray-800">{{ item.Productomedida.Producto.Nombre }}</p>
                    <p class="text-sm text-gray-600" v-if="item.Productomedida.Producto.Marca">
                        Marca: {{ item.Productomedida.Producto.Marca.Nombre }}
                    </p>
                    <p class="text-sm text-gray-600">
                        Cantidad: {{ item.Cantidad }} {{ item.Productomedida.Unidadmedida.Nombre }}
                        <span v-if="item.Productomedida.Unidadmedida.Categoria">
                            ({{ item.Productomedida.Unidadmedida.Categoria.Nombre }})
                        </span>
                    </p>
                    <p class="text-sm text-gray-600">Precio: {{ item.Precio }}</p>
                    <p class="text-sm text-gray-600">Fecha Vencimiento: {{ formatDate(item.FechaVencimineto) }}</p>
                </div>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(compra)"    class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
                <Edit class="h-4 w-4" />
                Editar
              </button>
              <button v-if="compra.estado !== 'Anulada'" @click="openCancelModal(compra)" class="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
        <!-- Pagination -->
      <div v-if="totalPaginas > 0" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
        <div class="text-gray-600 text-sm font-medium">
          {{ paginacionInfo }}
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
          <div class="flex items-center gap-1">
            <button
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              @click="paginaActual = page"
              :class="[
                'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
                paginaActual === page
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'hover:bg-orange-50 text-gray-600'
              ]"
            >
              {{ page }}
            </button>

            <button
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
              class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Registro/Edición Compra -->
    <div v-else>
       <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Truck class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                 {{ esEdicion ? 'Editar Compra' : 'Nueva Compra' }}
              </h1>
              <p class="text-gray-600 text-sm"> {{ esEdicion ? 'Actualiza la información de la compra' : 'Completa los datos de la nueva compra' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <form @submit.prevent="guardarCompra">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Columna Izquierda: Datos de la Compra -->
            <div class="space-y-6">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <Info class="h-5 w-5" />
                  Información de la Compra
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Nombre del Proveedor</label>
                    <select v-model="nuevaCompra.proveedor" @blur="errors.proveedor = validateField('proveedor', nuevaCompra.proveedor)" :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500', errors.proveedor ? 'border-red-500' : 'border-orange-200']">
                      <option disabled value="">Seleccione un proveedor</option>
                      <option v-for="provider in providers" :key="provider.IdProveedor" :value="provider.IdProveedor">
                        {{ provider.Persona.Nombre }} {{ provider.Persona.ApellidoPaterno }}
                      </option>
                    </select>
                    <p v-if="errors.proveedor" class="text-red-500 text-xs italic mt-1">{{ errors.proveedor }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Tipo de Comprobante</label>
                    <select v-model="nuevaCompra.tipo_comprobante" @blur="errors.tipo_comprobante = validateField('tipo_comprobante', nuevaCompra.tipo_comprobante)" :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500', errors.tipo_comprobante ? 'border-red-500' : 'border-orange-200']">
                      <option disabled value="">Seleccione un tipo</option>
                      <option v-for="tipo in comprobanteTypes" :key="tipo.IdComprobante" :value="tipo.IdComprobante">
                        {{ tipo.Nombre }}
                      </option>
                    </select>
                    <p v-if="errors.tipo_comprobante" class="text-red-500 text-xs italic mt-1">{{ errors.tipo_comprobante }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Número de Comprobante</label>
                    <input v-model="nuevaCompra.numero_comprobante" type="text" placeholder="Ej: 001-001-0000123" @blur="errors.numero_comprobante = validateField('numero_comprobante', nuevaCompra.numero_comprobante)" :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500', errors.numero_comprobante ? 'border-red-500' : 'border-orange-200']" />
                    <p v-if="errors.numero_comprobante" class="text-red-500 text-xs italic mt-1">{{ errors.numero_comprobante }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Insumos -->
            <div class="space-y-6">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-orange-800 flex items-center gap-2">
                        <Package class="h-5 w-5" />
                        Productos de la Compra
                    </h3>
                    <button @click.prevent="showAddInsumoModal = true" class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold flex items-center gap-2">
                        <Plus class="h-4 w-4" />
                        Nuevo Producto
                    </button>
                </div>
                <p v-if="errors.items" class="text-red-500 text-xs italic mb-4">{{ errors.items }}</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Producto</label>
                        <select v-model="selectedInsumoId" class="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="" disabled>Seleccione un producto</option>
                            <option v-for="insumo in insumos" :key="insumo.IdProducto" :value="insumo.IdProducto">
                                {{ insumo.Nombre }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Medida</label>
                        <select v-model="selectedMedidaId" :disabled="!selectedInsumoId" class="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100">
                            <option value="" disabled>Seleccione una medida</option>
                            <option v-for="medida in productoMedidas" :key="medida.IdProductoMedida" :value="medida.IdProductoMedida">
                                {{Number.isInteger(medida.Cantidad) ? medida.Cantidad : parseFloat(medida.Cantidad) }} {{ medida.Unidadmedida.Nombre }} - {{ medida.PrecioVenta }}, {{ medida.PrecioMayor }} Bs.
                            </option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Cantidad</label>
                            <div class="flex items-center">
                                <button @click.prevent="decrementCantidadInsumo" class="px-3 py-3 bg-gray-200 rounded-l-xl hover:bg-gray-300">-</button>
                                <input v-model.number="cantidadInsumo" type="number" min="1" placeholder="Cant." class="w-full px-2 py-3 bg-white/80 border-t border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center" />
                                <button @click.prevent="incrementCantidadInsumo" class="px-3 py-3 bg-gray-200 rounded-r-xl hover:bg-gray-300">+</button>
                            </div>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Vencimiento</label>
                            <input v-model="fechaVencimientoInsumo" type="date" class="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <button @click.prevent="addItem" class="w-full text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl py-3">
                        {{ EditingItemIndex !== null ? 'Actualizar Producto' : 'Agregar Producto a la Compra' }}
                    </button>
                </div>

                <div class="mt-6 pt-6 border-t border-orange-200 space-y-2" v-if="nuevaCompra.items.length > 0">
                    <div v-for="(item, index) in nuevaCompra.items" :key="index" class="flex items-center gap-4 p-3 bg-white/70 rounded-lg shadow-sm">
                        <span class="flex-grow font-semibold text-gray-800">{{ item.nombre }} <span class="text-gray-500 font-normal">({{ Number.isInteger(item.medidaCantidad) ? item.medidaCantidad : parseFloat(item.medidaCantidad)  }} {{ item.medidaNombre }})</span></span>
                        
                        <div class="flex items-center gap-1">
                            <button @click.prevent="decrementItemQuantity(index)" class="px-2 py-0.5 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">-</button>
                            <span class="w-8 text-center font-medium"> {{ item.cantidad }} </span>
                            <button @click.prevent="incrementItemQuantity(index)" class="px-2 py-0.5 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">+</button>
                        </div>

                        <span class="w-24 text-sm">Precio: {{ item.precio }} Bs.</span>
                        
                        <div class="flex items-center gap-2">
                            <input type="checkbox" :id="'precioMayorItemCheckbox-' + index" v-model="item.usarPrecioMayor" @change="togglePrecioMayor(index)" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                            <label :for="'precioMayorItemCheckbox-' + index" class="text-sm text-gray-700">P. Mayor</label>
                        </div>

                        <span class="w-32 text-sm">Vence: {{ item.fecha_vencimiento }}</span>
                        <button @click.prevent="removeItem(index)" class="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md"><Trash2 class="h-4 w-4" /></button>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
            <button type="button" @click="closeAddModal" class="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg">Cancelar</button>
            <button type="submit" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl shadow-lg">{{ esEdicion ? 'Actualizar' : 'Registrar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <InsumoAddModal 
      :show="showAddInsumoModal" 
      @close="showAddInsumoModal = false"
      @insumo-saved="handleInsumoAdded"
    />

    <!-- Cancel Purchase Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in">
        <div class="p-8 text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle class="h-10 w-10 text-red-500" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">¿Anular Compra?</h2>
          <p class="text-gray-600 mb-8">¿Está seguro de que desea anular la compra #{{ compraToCancel.IdCompra }}?</p>
          <div class="flex gap-4">
            <button @click="confirmAnularCompra" class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg">Sí, Anular</button>
            <button @click="closeCancelModal" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg">No, Conservar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
      :class="{
        'bg-green-500': toastType === 'success',
        'bg-red-500': toastType === 'error'
      }"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { Truck, Check, Plus, Trash2, AlertTriangle, Search, Package, Calendar, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, Edit, X, Info } from 'lucide-vue-next';
import InsumoAddModal from './InsumoAddModal.vue';
import { listarProveedores } from '@/Server/Proveedor';
import { listarCompras, registrarCompra, anularCompra, updateCompra } from '@/Server/Compra';
import { listarProductoConMedidas } from '@/Server/Producto';
import { listarInsumos } from '@/Server/Insumo';
import { Comprobante } from '@/Server/comprobante';

// Modal visibility states
const showRegistration = ref(false);
const esEdicion = ref(false);
const showCancelModal = ref(false);
const showAddInsumoModal = ref(false);

// Main data refs
const providers = ref([]);
const compras = ref([]);
const insumos = ref([]);
const compraExpandida = ref(null);

// Compra form refs
const initialCompra = {
  id: null,
  proveedor: '',
  tipo_comprobante: '',
  numero_comprobante: '',
  items: [],
  total: 0,
  fecha: new Date(),
  estado: 'Pendiente'
};
const nuevaCompra = ref({ ...initialCompra });
const selectedInsumoId = ref('');
const selectedMedidaId = ref('');
const productoMedidas = ref([]);
const cantidadInsumo = ref(1);
const fechaVencimientoInsumo = ref('');
const compraToCancel = ref(null);
const EditingItemIndex = ref(null);
const comprobanteTypes = ref([]);

// Search and pagination
const searchQuery = ref('');
const dateFilter = ref(new Date().toISOString().slice(0, 10));
const paginaActual = ref(1);
const itemsPerPage = 10;

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

const errors = reactive({
  proveedor: '',
  tipo_comprobante: '',
  numero_comprobante: '',
  items: ''
});

// Computed Properties
const filteredCompras = computed(() => {
    if (!searchQuery.value) {
        return compras.value;
    }
    const query = searchQuery.value.toLowerCase();
    return compras.value.filter(compra => {
        const providerName = `${compra.Proveedor.Persona.Nombre} ${compra.Proveedor.Persona.ApellidoPaterno}`.toLowerCase();
        if (providerName.includes(query)) {
            return true;
        }
        if (compra.Detallecompra && compra.Detallecompra.length > 0) {
            return compra.Detallecompra.some(detalle => {
                const productName = detalle.Productomedida.Producto.Nombre.toLowerCase();
                return productName.includes(query);
            });
        }
        return false;
    });
});

const totalPaginas = computed(() => {
    return Math.ceil(filteredCompras.value.length / itemsPerPage);
});

const comprasPaginadas = computed(() => {
    const start = (paginaActual.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCompras.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = filteredCompras.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} compras`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

const activeComprasCount = computed(() => {
  return compras.value.filter(compra => compra.Estado?.Nombre === 'Activo').length;
});

const totalComprasCount = computed(() => {
  return compras.value.length;
});

// Watchers
watch(selectedInsumoId, async (newId) => {
    if (newId) { 
      selectedMedidaId.value = '';
      await obtenerMedidadProducto(newId);
    } else {
      productoMedidas.value = [];  
    }
});

watch(dateFilter, () => {
  fetchCompras();
});

// Data Fetching Functions
const fetchProviders = async () => { try { providers.value = await listarProveedores(); } catch (e) { console.error(e); } };
const fetchCompras = async () => { try { compras.value = await listarCompras(dateFilter.value);  } catch (e) { console.error(e); } };
const fetchinsumos = async () => { try { insumos.value = await listarInsumos(); } catch (e) { console.error(e); } };
const obtenerMedidadProducto = async (id) => { try { productoMedidas.value = await listarProductoConMedidas(id); } catch (e) { console.error(e); } };
const ListarComprobantes = async () => { try {comprobanteTypes.value = await Comprobante();} catch (e) {console.error(e)}};

// Helper Functions
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// Compra Methods
const toggleDetalles = (compraId) => { compraExpandida.value = compraExpandida.value === compraId ? null : compraId; };
const openAddModal = () => {
  esEdicion.value = false;
  nuevaCompra.value = { ...initialCompra, items: [] };
  showRegistration.value = true;
};
const openEditModal = (compra) => {
    esEdicion.value = true;
    nuevaCompra.value = {
        id: compra.IdCompra,
        proveedor: compra.Proveedor.IdProveedor,
        tipo_comprobante: compra.Comprobante.IdComprobante,
        numero_comprobante: compra.NroComprobante,
        items: compra.Detallecompra.map(detalle => {
            const precioVenta = parseFloat(detalle.Productomedida.PrecioVenta);
            const precioMayor = parseFloat(detalle.Productomedida.PrecioMayor);
            const precioActual = parseFloat(detalle.Precio);
            return {
                IdDetalleCompra: detalle.IdDetalleCompra,
                insumoId: detalle.Productomedida.Producto.IdProducto,
                medidaId: detalle.Productomedida.IdProductoMedida,
                nombre: detalle.Productomedida.Producto.Nombre,
                marcaNombre: detalle.Productomedida.Producto.Marca?.Nombre,
                medidaNombre: detalle.Productomedida.Unidadmedida.Nombre,
                medidaCategoria: detalle.Productomedida.Unidadmedida.Categoria?.Nombre,
                medidaCantidad: detalle.Productomedida.Cantidad,
                cantidad: detalle.Cantidad,
                fecha_vencimiento: detalle.FechaVencimineto,
                precioVenta: precioVenta,
                precioMayor: precioMayor,
                usarPrecioMayor: precioActual === precioMayor,
                precio: precioActual
            };
        }),
        total: 0,
        fecha: compra.FechaCompra,
        estado: compra.Estado.Nombre
    };
    showRegistration.value = true;
};
const closeAddModal = () => { showRegistration.value = false; };

const addItem = () => {
  if (selectedInsumoId.value && selectedMedidaId.value && cantidadInsumo.value > 0 && fechaVencimientoInsumo.value) {
    const insumo = insumos.value.find(i => i.IdProducto === selectedInsumoId.value);
    const medida = productoMedidas.value.find(m => m.IdProductoMedida === selectedMedidaId.value);

    if (insumo && medida) {
      if (EditingItemIndex.value !== null) {
        const itemToUpdate = nuevaCompra.value.items[EditingItemIndex.value];
        itemToUpdate.insumoId = selectedInsumoId.value;
        itemToUpdate.medidaId = selectedMedidaId.value;
        itemToUpdate.nombre = insumo.Nombre;
        itemToUpdate.medidaNombre = medida?.Unidadmedida?.Nombre;
        itemToUpdate.medidaCantidad = medida.Cantidad;
        itemToUpdate.cantidad = cantidadInsumo.value;
        itemToUpdate.precioVenta = medida.PrecioVenta;
        itemToUpdate.precioMayor = medida.PrecioMayor;
        itemToUpdate.usarPrecioMayor = false;
        itemToUpdate.precio = itemToUpdate.usarPrecioMayor ? itemToUpdate.precioMayor : itemToUpdate.precioVenta;
        itemToUpdate.fecha_vencimiento = fechaVencimientoInsumo.value;
        EditingItemIndex.value = null;
      } else {
        const existingItem = nuevaCompra.value.items.find(item =>
          String(item.insumoId) === String(selectedInsumoId.value) &&
          String(item.medidaId) === String(selectedMedidaId.value) &&
          String(item.fecha_vencimiento) === String(fechaVencimientoInsumo.value)
        );

        if (existingItem) {
          existingItem.cantidad += cantidadInsumo.value;
        } else {
          nuevaCompra.value.items.push({
            insumoId: selectedInsumoId.value,
            medidaId: selectedMedidaId.value,
            nombre: insumo.Nombre,
            marcaNombre: insumo.Marca?.Nombre,
            medidaNombre: medida.Unidadmedida.Nombre,
            medidaCategoria: medida.Unidadmedida.Categoria?.Nombre,
            medidaCantidad: medida.Cantidad,
            cantidad: cantidadInsumo.value,
            fecha_vencimiento: fechaVencimientoInsumo.value,
            precioVenta: medida.PrecioVenta,
            precioMayor: medida.PrecioMayor,
            usarPrecioMayor: false,
            precio: medida.PrecioVenta
          });
        }
      }
      
      selectedInsumoId.value = '';
      selectedMedidaId.value = '';
      productoMedidas.value = [];
      cantidadInsumo.value = 1;
      fechaVencimientoInsumo.value = '';
    }
  }
};
const removeItem = (index) => { nuevaCompra.value.items.splice(index, 1); };

const incrementCantidadInsumo = () => {
  cantidadInsumo.value++;
};

const decrementCantidadInsumo = () => {
  if (cantidadInsumo.value > 1) {
    cantidadInsumo.value--;
  }
};

const incrementItemQuantity = (index) => {
  nuevaCompra.value.items[index].cantidad++;
};

const decrementItemQuantity = (index) => {
  if (nuevaCompra.value.items[index].cantidad > 1) {
    nuevaCompra.value.items[index].cantidad--;
  }
};

const togglePrecioMayor = (index) => {
  const item = nuevaCompra.value.items[index];
  item.precio = item.usarPrecioMayor ? item.precioMayor : item.precioVenta;
};

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'proveedor':
      if (!value) error = 'Debe seleccionar un proveedor.';
      break;
    case 'tipo_comprobante':
      if (!value) error = 'Debe seleccionar un tipo de comprobante.';
      break;
    case 'numero_comprobante':
      if (!value || !value.trim()) error = 'El número de comprobante es requerido.';
      // Regex allows for formats like 001-001-0000123
      else if (!/^\d{3}-\d{3}-\d{7,}$/.test(value)) error = 'Formato inválido. Ej: 001-001-0000123.';
      break;
    case 'items':
      if (!value || value.length === 0) error = 'Debe agregar al menos un producto a la compra.';
      break;
  }
  return error;
};

const validateForm = () => {
  errors.proveedor = validateField('proveedor', nuevaCompra.value.proveedor);
  errors.tipo_comprobante = validateField('tipo_comprobante', nuevaCompra.value.tipo_comprobante);
  errors.numero_comprobante = validateField('numero_comprobante', nuevaCompra.value.numero_comprobante);
  errors.items = validateField('items', nuevaCompra.value.items);

  return Object.values(errors).every(error => !error);
};

const guardarCompra = async () => {
  // Clear items error before validating
  errors.items = '';
  if (!validateForm()) {
    // Find the first error and show a general message
    const firstError = Object.values(errors).find(e => e);
    showToastMessage(firstError || 'Por favor, corrija los errores en el formulario.', 'error');
    return;
  }
  try {
  const datoCompra = {
    IdCompra: nuevaCompra.value.id,
    IdProveedor : nuevaCompra.value.proveedor,
    Numero:nuevaCompra.value.numero_comprobante,
    Comprobante:nuevaCompra.value.tipo_comprobante,
    detalles: nuevaCompra.value.items.map(item => ({
                Iddetalle: item.IdDetalleCompra,
                IdMedida: item.medidaId,
                Precio: item.precio,
                Fecha: item.fecha_vencimiento,
                Cantidad: item.cantidad
            }))
  }
    let response;
    if (esEdicion.value) { 
     response = await updateCompra(datoCompra); } 
    else { 
      response = await registrarCompra(datoCompra); }
   
    await fetchCompras();
    closeAddModal();
    showToastMessage(response.message, 'success');
  } catch (error) {
    console.error('Error al guardar la compra:', error);
    showToastMessage('Error al guardar la compra', 'error');
  }
};
const openCancelModal = (compra) => {
  compraToCancel.value = compra;
  showCancelModal.value = true;
};
const closeCancelModal = () => {
  showCancelModal.value = false;
  compraToCancel.value = null;
};
const confirmAnularCompra = async () => {
  if (compraToCancel.value) {
      try {
          const response = await anularCompra(compraToCancel.value.IdCompra);
          await fetchCompras();
          showToastMessage(response.message, 'success');
      } catch (error) {
        console.error('Error al anular la compra:', error);
        showToastMessage('Error al anular la compra', 'error');
      }
  }
  closeCancelModal();
};

const handleInsumoAdded = () => {
  fetchinsumos();
  showAddInsumoModal.value = false;
};

// Helper Functions
const formatDate = (date) => {
    if (typeof date === 'string') return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const getStatusClass = (estado) => {
  switch (estado) {
    case 'Pendiente': return 'bg-yellow-500 text-white shadow-md';
    case 'Recibida': return 'bg-green-500 text-white shadow-md';
    case 'Activo': return 'bg-green-500 text-white shadow-md';
    case 'Anulado': return 'bg-red-500 text-white shadow-md';
    default: return 'bg-gray-500 text-white shadow-md';
  }
};

// Lifecycle Hook
onMounted(async () => {
  await Promise.all([
    fetchProviders(),
    fetchCompras(),
    fetchinsumos(),
    ListarComprobantes()
  ]);
});

</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slide-in {
  animation: slide-in-right 0.5s forwards;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
