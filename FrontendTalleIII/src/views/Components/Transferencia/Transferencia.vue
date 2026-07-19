<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8">
    <div class="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <Transition name="fade" mode="out-in">
      <div v-if="initializing" key="initializing" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg animate-bounce-slow">
                  <ArrowRightLeft class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Módulo de Transferencias...
          </h3>
        </div>
      </div>

      <div v-else key="main-content">
        <div v-if="modoRegistro" key="registro">
          <RegistrarTransferencia 
            :sucursalId="currentSucursalId"
            @cancel="modoRegistro = false"
            @success="onTransferenciaSuccess"
          />
        </div>

        <div v-else key="vistas-principales">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <ArrowRightLeft class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de Transferencias
                  </h1>
                  <p class="text-gray-600 text-sm">Historial y registro de movimientos de stock</p>
                </div>
              </div>

              <div class="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
                <button 
                  @click="handleTabChange('historial')"
                  :class="['flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2', tabActiva === 'historial' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  <Calendar class="h-4 w-4" />
                  Historial
                </button>
                <button 
                  @click="handleTabChange('existencias')"
                  :class="['flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2', tabActiva === 'existencias' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  <Package class="h-4 w-4" />
                  Existencias
                </button>
              </div>

              <div class="flex items-center gap-3">
                 <button 
                  @click="modoRegistro = true" 
                  class="bg-linear-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                >
                  <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span class="font-semibold hidden sm:inline">Nueva Transferencia</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="tabActiva === 'historial'" key="historial" class="animate-fade-in">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
              <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Fecha</label>
                    <div 
                      class="relative group cursor-pointer"
                      @click="openDatePicker"
                    >
                      <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
                      
                      <!-- Facade: Muestra la fecha formateada -->
                      <input 
                        type="text" 
                        readonly
                        :value="formatearFechaLocal(filtros.fecha)"
                        placeholder="dd/mm/aaaa"
                        class="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-200 rounded-2xl transition-all text-gray-700 outline-none shadow-sm cursor-pointer"
                      />

                      <!-- Native Input: Oculto -->
                      <input 
                        ref="dateInput"
                        type="date" 
                        v-model="filtros.fecha"
                        class="absolute opacity-0 pointer-events-none w-0 h-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Sucursal Origen</label>
                    <select 
                      v-model="filtros.idsucursalorigen"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option :value="null">Todas las sucursales</option>
                      <option v-for="suc in sucursales" :key="suc.idsucursal" :value="suc.idsucursal">
                        {{ suc.nombre }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Sucursal Destino</label>
                    <select 
                      v-model="filtros.idsucursaldestino"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option :value="null">Todas las sucursales</option>
                      <option v-for="suc in sucursales" :key="suc.idsucursal" :value="suc.idsucursal">
                        {{ suc.nombre }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Empleado Destino</label>
                    <select 
                      v-model="filtros.idempleadodestino"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    > 
                      <option :value="null">Todos los empleados</option>
                      <option v-for="emp in empleados" :key="emp.idempleado" :value="emp.idempleado">
                        {{ emp.nombre }} {{ emp.apellidopaterno }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-gray-500">Mostrar:</span>
                    <div class="flex bg-gray-100 p-1 rounded-2xl">
                      <button 
                        v-for="lim in [8, 12, 20, 50]" 
                        :key="lim"
                        @click="limit = lim"
                        :class="['px-4 py-1.5 rounded-xl text-sm font-semibold transition-all', limit === lim ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                      >
                        {{ lim }}
                      </button>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    Total: <span class="text-orange-600 font-bold">{{ total }}</span> transferencias
                  </div>
                </div>
              </div>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="transferencias.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                <TransferenciaCard 
                  v-for="trans in transferencias" 
                  :key="trans.idtransferencia"
                  :transferencia="trans"
                  @view="verDetalle"
                  @anular="confirmarAnulacion"
                />
              </div>
              <div v-else class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 animate-fade-in">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageOpen class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron transferencias</h3>
                <p class="text-gray-500">Intenta cambiar los filtros o registra una nueva</p>
              </div>

              <div class="mt-8 flex justify-center">
                <Paginado 
                  v-if="totalPages >= 1"
                  :paginaActual="page"
                  :totalPaginas="totalPages"
                  :total="total"
                  :limite="limit"
                  @update:paginaActual="onPageChange"
                />
              </div>
            </div>
          </div>

          <div v-if="tabActiva === 'existencias'" key="existencias" class="animate-fade-in">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
              <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                  <button 
                    @click="handleSubTabExistencias('productos')"
                    :class="['flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2', subTabExistencias === 'productos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                  >
                    <Package class="h-4 w-4" />
                    Productos
                  </button>
                  <button 
                    @click="handleSubTabExistencias('insumos')"
                    :class="['flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2', subTabExistencias === 'insumos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                  >
                    <FlaskConical class="h-4 w-4" />
                    Insumos
                  </button>
                </div>

                <!-- Search and Filters -->
                <div class="flex flex-col md:flex-row items-center gap-4 w-full flex-1">
                  <!-- Filtros Productos (Igual a Venta.vue) -->
                  <div v-if="subTabExistencias === 'productos'" class="w-full">
                    <FiltrosProducto
                      v-model:search="filtroNombreExistencias"
                      v-model:categoria="filtroCategoriaExistencias"
                      v-model:subcategoria="filtroSubcategoriaExistencias"
                      v-model:limite="pagProd.limit"
                      :categorias="categorias"
                      @update:limite="(val) => { pagProd.limit = val; pagProd.page = 1; fetchExistencias(); }"
                      @update:categoria="() => { pagProd.page = 1; fetchExistencias(); }"
                      @update:subcategoria="() => { pagProd.page = 1; fetchExistencias(); }"
                      @update:search="() => { pagProd.page = 1; fetchExistencias(); }"
                    />
                  </div>

                  <!-- Filtros Insumos -->
                  <div v-else class="flex flex-col md:flex-row items-center gap-4 w-full">
                    <div class="relative flex-1">
                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        v-model="filtroNombreExistencias"
                        @input="() => { pagIns.page = 1; fetchExistencias(); }"
                        type="text" 
                        placeholder="Buscar insumo por nombre..."
                        class="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                      />
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-gray-400 uppercase">Ver:</span>
                      <div class="flex bg-gray-100 p-1 rounded-2xl">
                        <button 
                          v-for="lim in [8, 12, 24, 48]" 
                          :key="lim"
                          @click="pagIns.limit = lim; pagIns.page = 1; fetchExistencias();"
                          :class="['px-3 py-1 rounded-xl text-xs font-bold transition-all', pagIns.limit === lim ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                        >
                          {{ lim }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <div class="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  Total Encontrados: <span class="text-orange-600 font-bold">{{ subTabExistencias === 'productos' ? pagProd.total : pagIns.total }}</span> items
                </div>
              </div>
            </div>

            <div v-if="loadingExistencias" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="(subTabExistencias === 'productos' && productos.length > 0) || (subTabExistencias === 'insumos' && insumos.length > 0)" 
                   class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                
                <template v-if="subTabExistencias === 'productos'">
                  <Productocard 
                    v-for="prod in productos" 
                    :key="'prod-' + (prod.idproducto || prod.IdProducto)"
                    :producto="prod"
                    :medidas="prod.medidas || []"
                  />
                </template>

                <template v-else>
                  <InsumoCard 
                    v-for="insumo in insumos" 
                    :key="'ins-' + insumo.IdInsumo"
                    :insumo="insumo"
                    :readonly="true"
                  />
                </template>
              </div>

              <div v-else class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 animate-fade-in">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageOpen class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron items</h3>
                <p class="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
              </div>

              <div class="mt-8 flex justify-center">
                <Paginado 
                  v-if="subTabExistencias === 'productos' && pagProd.totalPages >= 1"
                  :paginaActual="pagProd.page"
                  :totalPaginas="pagProd.totalPages"
                  :total="pagProd.total"
                  :limite="pagProd.limit"
                  @update:paginaActual="(p) => { pagProd.page = p; fetchExistencias(); }"
                />
                <Paginado 
                  v-else-if="subTabExistencias === 'insumos' && pagIns.totalPages >= 1"
                  :paginaActual="pagIns.page"
                  :totalPaginas="pagIns.totalPages"
                  :total="pagIns.total"
                  :limite="pagIns.limit"
                  @update:paginaActual="(p) => { pagIns.page = p; fetchExistencias(); }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <TransitionRoot appear :show="showDetailModal" as="template">
      <Dialog as="div" @close="showDetailModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                <DialogTitle as="h3" class="text-2xl font-bold text-gray-900 flex items-center justify-between mb-6">
                  Detalles de Transferencia
                  <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <X class="h-6 w-6" />
                  </button>
                </DialogTitle>

                <div v-if="selectedTransferencia" class="space-y-6">
                  <div class="grid grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6">
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase mb-1">ID Transferencia</p>
                      <p class="font-bold text-gray-800">{{ selectedTransferencia.idtransferencia }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase mb-1">Estado</p>
                      <span :class="[
                        'px-3 py-1 rounded-full text-xs font-bold uppercase',
                        selectedTransferencia.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      ]">
                        {{ selectedTransferencia.estado === 1 ? 'Activo' : 'Anulado' }}
                      </span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase mb-1">Fecha</p>
                      <p class="text-gray-700">{{ formatDate(selectedTransferencia.fecha) }} {{ selectedTransferencia.hora }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase mb-1">Tipo</p>
                      <p class="text-gray-700">{{ selectedTransferencia.tipo }}</p>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-2xl border border-gray-100">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-gray-50 text-gray-600 font-bold">
                        <tr>
                          <th class="px-4 py-3">Item</th>
                          <th class="px-4 py-3">Tipo</th>
                          <th class="px-4 py-3 text-center">Cantidad</th>
                          <th class="px-4 py-3 text-right">Detalle</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="det in selectedTransferencia.Detalletransferencia" :key="det.IdDetalleTransferencia" class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3 font-medium">{{ det.Producto?.Nombre || det.Insumo?.Nombre }}</td>
                          <td class="px-4 py-3">
                            <span :class="['px-2 py-1 rounded-lg text-[10px] font-bold uppercase', det.Producto ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600']">
                              {{ det.Producto ? 'Producto' : 'Insumo' }}
                            </span>
                          </td>
                          <td class="px-4 py-3 font-bold text-center">{{ det.Cantidad }}</td>
                          <td class="px-4 py-3 text-right text-gray-500">{{ det.ProductoMedida?.Presentacion?.Nombre || det.Insumomedida?.Unidadmedida?.Nombre || 'S/D' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="mt-8 flex justify-end">
                  <button @click="showDetailModal = false" class="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">Cerrar</button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div :class="['px-6 py-4 rounded-2xl shadow-xl text-white font-bold flex items-center gap-3', notification.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ notification.message }}
      </div>
    </div>

    <AnularVentaModal
      :isOpen="showAnularModal"
      :idVenta="idTransferenciaParaAnular"
      :loading="loadingAnulacion"
      title="Anular Transferencia"
      message="¿Estás seguro de que deseas anular esta transferencia? Esta acción revertirá los movimientos de stock realizados. No se puede deshacer."
      confirmText="Anular Transferencia"
      @close="showAnularModal = false"
      @confirm="ejecutarAnulacion"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { 
  ArrowRightLeft, Plus, Search, X, PackageOpen, 
  ChevronRight, Calendar, Info, CheckCircle, AlertTriangle,
  Package, FlaskConical, Filter
} from 'lucide-vue-next';
import { 
  Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild 
} from '@headlessui/vue';

// Services
import { getTransferencias, anularTransferencia } from '@/Server/Transferencia';
import { Listsucursal } from '@/Server/Sucural';
import { getEmpleadosVendedores } from '@/Server/Empleado';
import { SucursalUsuario } from '@/Server/Usuario';
import { ListarProductosOnSucursal } from '@/Server/Producto';
import { getInsumosSucursal } from '@/Server/Produccion';
import { listCategorias } from '@/Server/Categoria';

// Components
import RegistrarTransferencia from './RegistrarTransferencia.vue';
import TransferenciaCard from './TransferenciaCard.vue';
import Productocard from '../Venta/Productocard.vue';
import InsumoCard from './InsumoCard.vue';
import FiltrosProducto from '../Venta/FiltrosProducto.vue';
import Paginado from '../Modals/Paginado.vue';
import AnularVentaModal from '../Venta/AnularVentaModal.vue';

// Estado
const initializing = ref(true);
const loading = ref(false);
const modoRegistro = ref(false);
const tabActiva = ref('historial'); // 'historial' o 'existencias'
const transferencias = ref([]);
const sucursales = ref([]);
const empleados = ref([]);
const currentSucursalId = ref(null);
const notification = ref(null);

// Estado para Existencias
const productos = ref([]);
const insumos = ref([]);
const loadingExistencias = ref(false);
const subTabExistencias = ref('productos'); // 'productos' o 'insumos'
const filtroNombreExistencias = ref('');
const categorias = ref([]);
const filtroCategoriaExistencias = ref('TODOS');
const filtroSubcategoriaExistencias = ref('TODOS');

// Paginación Existencias
const pagProd = reactive({ page: 1, limit: 12, total: 0, totalPages: 1 });
const pagIns = reactive({ page: 1, limit: 12, total: 0, totalPages: 1 });

// Anulación logic state
const showAnularModal = ref(false);
const idTransferenciaParaAnular = ref('');
const loadingAnulacion = ref(false);

// Paginación y Filtros
const page = ref(1);
const limit = ref(12);
const total = ref(0);
const totalPages = ref(1);
const filtros = ref({
  fecha: new Date().toLocaleDateString('en-CA'),
  idsucursalorigen: null,
  idsucursaldestino: null,
  idempleadodestino: null
});

const dateInput = ref(null);

const openDatePicker = () => {
  if (dateInput.value) {
    try {
      dateInput.value.showPicker();
    } catch (e) {
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

// Detalle
const showDetailModal = ref(false);
const selectedTransferencia = ref(null);

// Formateador de fecha latinoamericana
const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// Methods
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const obtenerSucursalUsuario = async (id) => {
  try {
    const response = await SucursalUsuario(id);
    if (response && response.idsucursal) {
      currentSucursalId.value = response.idsucursal;
      filtros.value.idsucursalorigen = response.idsucursal;
    }
  } catch (e) { console.error('Error al obtener sucursal del usuario:', e); }
};

const cargarCatalogos = async () => {
  try {
    const [suc, emp] = await Promise.all([
      Listsucursal(),
      getEmpleadosVendedores()
    ]);
    sucursales.value = suc.result || suc || [];
    empleados.value =  emp.result || emp || [];
  } catch (error) {
    console.error(error);
  }
};

const fetchTransferencias = async () => {
  loading.value = true;
  try {
    const data = await getTransferencias(
      filtros.value.idsucursalorigen,
      filtros.value.idsucursaldestino,
      filtros.value.idempleadodestino,
      limit.value,
      page.value,
      filtros.value.fecha
    );
    transferencias.value = data.data || [];
    total.value = parseInt(data.total) || 0;
    totalPages.value = data.totalPages || 1;
  } catch (error) {
   console.error('Error al obtener transferencias');
  } finally {
    loading.value = false;
  }
};

const fetchExistencias = async () => {
  if (!currentSucursalId.value) return;
  loadingExistencias.value = true;
  try {
    if (subTabExistencias.value === 'productos') {
      const res = await ListarProductosOnSucursal(
        currentSucursalId.value,
        filtroNombreExistencias.value,
        pagProd.limit,
        pagProd.page,
        filtroCategoriaExistencias.value === 'TODOS' ? '' : filtroCategoriaExistencias.value,
        filtroSubcategoriaExistencias.value === 'TODOS' ? '' : filtroSubcategoriaExistencias.value
      );
      productos.value = res.result || res.data || [];
      pagProd.total = parseInt(res.total) || productos.value.length;
      pagProd.totalPages = Math.ceil(pagProd.total / pagProd.limit) || 1;
    } else {
      const res = await getInsumosSucursal(
        currentSucursalId.value,
        filtroNombreExistencias.value,
        pagIns.limit,
        pagIns.page
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
      pagIns.total = parseInt(res.total) || insumos.value.length;
      pagIns.totalPages = parseInt(res.totalPages) || Math.ceil(pagIns.total / pagIns.limit) || 1;
    }
  } catch (error) {
    console.error('Error fetching existencias:', error);
  } finally {
    loadingExistencias.value = false;
  }
};

const cargarCategorias = async () => {
  try {
    const cat = await listCategorias();
    categorias.value = cat.result || cat || [];
  } catch (error) {
    console.error(error);
  }
};

const handleTabChange = (tab) => {
  tabActiva.value = tab;
  if (tab === 'existencias') {
    fetchExistencias();
    cargarCategorias();
  } else {
    fetchTransferencias();
  }
};

const handleSubTabExistencias = (subTab) => {
  subTabExistencias.value = subTab;
  fetchExistencias();
};

const onTransferenciaSuccess = () => {
  modoRegistro.value = false;
  tabActiva.value = 'historial';
  page.value = 1;
  fetchTransferencias();
  showNotification('Transferencia registrada con éxito', 'success');
};

const onPageChange = (newPage) => {
  page.value = newPage;
  fetchTransferencias();
};

const verDetalle = (trans) => {
  selectedTransferencia.value = trans;
  showDetailModal.value = true;
};

const confirmarAnulacion = (trans) => {
  idTransferenciaParaAnular.value = trans.idtransferencia;
  showAnularModal.value = true;
};

const ejecutarAnulacion = async (id) => {
  loadingAnulacion.value = true;
  try {
    await anularTransferencia(id);
    showNotification('Transferencia anulada', 'success');
    showAnularModal.value = false;
    fetchTransferencias();
  } catch (error) {
    showNotification('Error al anular transferencia', 'error');
  } finally {
    loadingAnulacion.value = false;
  }
};

watch(filtros, () => {
  page.value = 1;
  fetchTransferencias();
}, { deep: true });

watch(limit, () => {
  page.value = 1;
  fetchTransferencias();
});

// Watchers para Existencias
watch([filtroNombreExistencias, filtroCategoriaExistencias, filtroSubcategoriaExistencias], () => {
  if (subTabExistencias.value === 'productos') {
    pagProd.page = 1;
    fetchExistencias();
  } else {
    pagIns.page = 1;
    fetchExistencias();
  }
});

onMounted(async () => {
  initializing.value = true;
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const u = JSON.parse(usuarioStr);
      await obtenerSucursalUsuario(u.IdUsuario);
    }
    await cargarCatalogos();
    await fetchTransferencias();
  } catch (error) {
    console.error(error);
  } finally {
    initializing.value = false;
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
.animate-bounce-slow { animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
