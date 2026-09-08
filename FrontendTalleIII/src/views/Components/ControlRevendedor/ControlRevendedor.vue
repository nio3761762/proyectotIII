<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8">
    <!-- Background decorations -->
    <div class="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading State Initial -->
    <Transition name="fade" mode="out-in">
      <div v-if="initializing" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg animate-bounce-slow">
                  <Users class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Panel de Personas...
          </h3>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- History / Catalog View -->
        <div v-if="!modoRegistro">
          <!-- Header -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6 animate-fade-in">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <Users class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Control de Personas
                  </h1>
                  <p class="text-gray-600 text-sm">Gestiona entregas y liquidaciones</p>
                </div>
              </div>
              
              <!-- Tabs Navigation -->
              <div class="flex bg-gray-100 p-1 rounded-2xl">
                <button 
                  @click="tabActiva = 'catalogo'"
                  :class="['px-6 py-2 rounded-xl font-semibold transition-all', tabActiva === 'catalogo' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  Catálogo
                </button>
                <button 
                  @click="tabActiva = 'historial'"
                  :class="['px-6 py-2 rounded-xl font-semibold transition-all', tabActiva === 'historial' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  Historial
                </button>
              </div>

              <button 
                @click="nuevoRegistro" 
                class="bg-linear-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span class="font-semibold hidden sm:inline">Registrar Entrega</span>
              </button>
            </div>
          </div>

          <!-- Catalog View -->
          <div v-if="tabActiva === 'catalogo'" class="space-y-6 animate-fade-in">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <FiltrosProducto
                v-model:search="busquedaCatalogo"
                v-model:sucursal="filtrosCatalogo.sucursal"
                v-model:categoria="filtrosCatalogo.categoria"
                v-model:subcategoria="filtrosCatalogo.subcategoria"
                v-model:limite="limiteProductos"
                :sucursales="sucursales"
                :categorias="categoriasCatalogo"
                :isAdmin="isAdmin"
                :disableSucursal="false"
                @update:limite="onLimiteProductosChange"
              />
            </div>

            <div v-if="loadingCatalog" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="!puedeVenderEnEstaSucursal" class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-800 animate-fade-in">
                <AlertTriangle class="h-5 w-5 shrink-0" />
                <p class="text-sm font-medium">
                  {{ isAdmin && !tieneSucursal ? 'Selecciona una sucursal para ver existencias.' : 'Visualizando productos de la sucursal seleccionada.' }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Productocard 
                  v-for="prod in productosList" 
                  :key="prod.idproducto || prod.IdProducto"
                  :producto="prod"
                  :medidas="prod.Productomedida || prod.medidas || []"
                  :disabled="!puedeVenderEnEstaSucursal"
                  @select-medida="seleccionarProductoDeCatalogo"
                />
              </div>
              <div v-if="productosList.length === 0" class="text-center py-10 text-gray-500">
                No se encontraron productos en esta sucursal.
              </div>
              
              <div class="pt-6 border-t border-gray-100 mt-8">
                <Paginado
                  v-if="paginacionProductos.totalPaginas >= 1"
                  :paginaActual="paginacionProductos.paginaActual"
                  :totalPaginas="paginacionProductos.totalPaginas"
                  :total="paginacionProductos.total"
                  :limite="limiteProductos"
                  @update:paginaActual="onCambiarPaginaProductos"
                />
              </div>
            </div>
          </div>

          <!-- Historial View -->
          <div v-if="tabActiva === 'historial'" class="space-y-6 animate-fade-in">
            <FiltrosControlRevendedor 
              v-model="filtros"
              v-model:vistaModo="vistaModo"
              :sucursales="sucursales"
              :limit="paginacion.limit"
              :exportandoPdf="exportandoPDF"
              @update:limit="onLimiteHistorialChange"
              @filter="cargarControles"
              @export-pdf="exportarPDF"
            />

            <div v-if="loading" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>

            <div v-else>
              <div v-if="controles.length === 0" class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron registros</h3>
                <p class="text-gray-500 mb-6">Intenta cambiar los filtros o registra una nueva entrega.</p>
                <button @click="nuevoRegistro" class="text-orange-600 font-semibold hover:underline">
                  Registrar Primera Entrega
                </button>
              </div>

              <div v-else class="space-y-6">
                <div v-if="vistaModo === 'card'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <ControlRevendedorCard 
                    v-for="c in controles" 
                    :key="c.idrevendedorcontrol" 
                    :control="c"
                    @edit-detail="abrirAjuste"
                    @edit="editarControl"
                  />
                </div>
                <ControlRevendedorTable 
                  v-else 
                  :controles="controles" 
                  @edit="editarControl"
                />

                <Paginado
                  v-if="totalPaginas >= 1"
                  :paginaActual="paginacion.page"
                  :totalPaginas="totalPaginas"
                  :total="totalItems"
                  :limite="paginacion.limit"
                  @update:paginaActual="cambiarPagina"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Registration View --> 
        <div v-else class="animate-fade-in">
          <RegistrarControlRevendedor 
            :sucursales="sucursales"
            :productoInicial="productoInicial"
            :controlEditar="controlEnEdicion"
            @cancel="cancelarRegistro"
            @saved="onControlSaved"
          />
        </div>
      </div>
    </Transition>

    <!-- Modals -->
    <AjustarDetalleModal 
      :isOpen="showAjusteModal"
      :detalle="selectedDetalle"
      @close="showAjusteModal = false"
      @updated="cargarControles"
    />

    <!-- Toasts / Notifications -->
    <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div :class="['px-6 py-4 rounded-2xl shadow-xl text-white font-bold flex items-center gap-3', notification.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoMasasCori from '@/views/assets/LogoMasasCorir.png';
import { 
  Users, TrendingUp, LayoutGrid, List as ListIcon, Search, 
  ChevronLeft, ChevronRight, CheckCircle, Plus, ShoppingCart, Package, AlertTriangle
} from 'lucide-vue-next';

// Components
import FiltrosControlRevendedor from './subcomponents/FiltrosControlRevendedor.vue';
import ControlRevendedorCard from './subcomponents/ControlRevendedorCard.vue';
import ControlRevendedorTable from './subcomponents/ControlRevendedorTable.vue';
import RegistrarControlRevendedor from './subcomponents/RegistrarControlRevendedor.vue';
import AjustarDetalleModal from './subcomponents/AjustarDetalleModal.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';
import Productocard from '../Venta/Productocard.vue';
import FiltrosProducto from '../Venta/FiltrosProducto.vue';

// API
import { listarControlRevendedor } from '@/Server/ControlRevendedor';
import { Listsucursal } from '@/Server/Sucural';
import { ListarProductosOnSucursal } from '@/Server/Producto';
import { listCategorias } from '@/Server/Categoria';
import { SucursalUsuario } from '@/Server/Usuario';
import { useSessionStore } from '@/stores/sessionStore';

// State
const sessionStore = useSessionStore();
const isAdmin = computed(() => {
  return sessionStore.rolSeleccionado?.Nombre?.toUpperCase() === 'ADMINISTRADOR';
});

const initializing = ref(true);
const loading = ref(false);
const modoRegistro = ref(false);
const tabActiva = ref('catalogo');
const vistaModo = ref('card');
const controles = ref([]);
const sucursales = ref([]);
const totalItems = ref(0);
const productoInicial = ref(null);
const controlEnEdicion = ref(null);
const exportandoPDF = ref(false);

// Catálogo State
const loadingCatalog = ref(false);
const productosList = ref([]);
const categoriasCatalogo = ref([]);
const busquedaCatalogo = ref('');
const limiteProductos = ref(12);
const filtrosCatalogo = reactive({
  sucursal: 'TODOS',
  categoria: 'TODOS',
  subcategoria: 'TODOS'
});
const paginacionProductos = reactive({
  paginaActual: 1,
  totalPaginas: 1,
  total: 0
});

const hoy = new Date().toLocaleDateString('en-CA');
const filtros = ref({ 
  fecha: hoy,
  idempleado: '', 
  idsucursal: ''
});

const paginacion = reactive({
  page: 1,
  limit: 9
});

const totalPaginas = computed(() => Math.ceil(totalItems.value / paginacion.limit) || 1);

const puedeVenderEnEstaSucursal = computed(() => {
  if (filtrosCatalogo.sucursal === 'TODOS') return false;
  if (tieneSucursal.value) {
    return filtrosCatalogo.sucursal === currentSucursalId.value;
  }
  return isAdmin.value;
});

const currentSucursalId = ref(null);
const tieneSucursal = ref(false);

// Modal State
const showAjusteModal = ref(false);
const selectedDetalle = ref(null);

// Notification State
const notification = ref(null);
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const obtenerSucursalUsuario = async (id) => {
  try {
    const response = await SucursalUsuario(id);
    if (response && response.idsucursal) {
      currentSucursalId.value = response.idsucursal;
      filtrosCatalogo.sucursal = response.idsucursal;
      filtros.value.idsucursal = response.idsucursal;
      tieneSucursal.value = true;
    }
  } catch (e) { console.error('Error al obtener sucursal del usuario:', e); }
};

const cargarControles = async () => {
  loading.value = true;
  try {
    const res = await listarControlRevendedor(
      filtros.value.fecha || null,
      filtros.value.idempleado || null,
      filtros.value.idsucursal || null,
      paginacion.page,
      paginacion.limit
    );
    controles.value = (res.data || []).map(c => ({ ...c, GastoExtra: Number(c.GastoExtra) || 0 }));
    totalItems.value = res.total || 0;
  } catch (error) {
    console.error("Error al cargar controles", error);
  } finally {
    loading.value = false;
  }
};

const cargarProductosCatalogo = async () => {
  const branchToSearch = filtrosCatalogo.sucursal;
  if (!branchToSearch || branchToSearch === 'TODOS') {
    productosList.value = [];
    return;
  }
  
  loadingCatalog.value = true;
  try {
    const res = await ListarProductosOnSucursal(
      branchToSearch,
      busquedaCatalogo.value,
      limiteProductos.value,
      paginacionProductos.paginaActual,
      filtrosCatalogo.categoria === 'TODOS' ? null : filtrosCatalogo.categoria,
      filtrosCatalogo.subcategoria === 'TODOS' ? null : filtrosCatalogo.subcategoria
    );
    productosList.value = res.result || [];
    paginacionProductos.total = parseInt(res.total) || productosList.value.length;
    paginacionProductos.totalPaginas = Math.ceil(paginacionProductos.total / limiteProductos.value) || 1;
  } catch (error) {
    console.error("Error al cargar productos", error);
  } finally {
    loadingCatalog.value = false;
  }
};

const cargarCategoriasCatalogo = async () => {
  try {
    const res = await listCategorias();
    categoriasCatalogo.value = res.result || res || [];
  } catch (error) {
    console.error("Error al cargar categorías", error);
  }
};

const cargarSucursales = async () => {
  try {
    const res = await Listsucursal();
    sucursales.value = res.result || res || [];
  } catch (error) { console.error(error); }
};

const cambiarPagina = (p) => {
  paginacion.page = p;
  cargarControles();
};

const onLimiteHistorialChange = (l) => {
  paginacion.limit = l;
  paginacion.page = 1;
  cargarControles();
};

const onCambiarPaginaProductos = (p) => {
  paginacionProductos.paginaActual = p;
  cargarProductosCatalogo();
};

const onLimiteProductosChange = (l) => {
  limiteProductos.value = l;
  paginacionProductos.paginaActual = 1;
  cargarProductosCatalogo();
};

const onControlSaved = () => {
  modoRegistro.value = false;
  controlEnEdicion.value = null;
  productoInicial.value = null;
  cargarControles();
  showNotification('Control guardado correctamente');
};

const editarControl = (c) => {
  controlEnEdicion.value = c;
  productoInicial.value = null;
  modoRegistro.value = true;
};

const nuevoRegistro = () => {
  controlEnEdicion.value = null;
  productoInicial.value = null;
  modoRegistro.value = true;
};

const abrirAjuste = (det) => {
  selectedDetalle.value = det;
  showAjusteModal.value = true;
};

const seleccionarProductoDeCatalogo = ({ producto, medida }) => {
  productoInicial.value = { producto, medida };
  controlEnEdicion.value = null;
  modoRegistro.value = true;
};

const cancelarRegistro = () => {
  modoRegistro.value = false;
  productoInicial.value = null;
  controlEnEdicion.value = null;
};

const formatoFecha = (f) => {
  if (!f) return 'N/A';
  const clean = String(f).split('T')[0];
  const [y, m, d] = clean.split('-');
  return `${d}/${m}/${y}`;
};

const formatoBs = (val) => `Bs ${Number(val || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getImageBase64PDF = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al cargar la imagen:', error);
    return null;
  }
};

const exportarPDF = async () => {
  if (!filtros.value.fecha) {
    showNotification('Selecciona una fecha para exportar', 'error');
    return;
  }
  exportandoPDF.value = true;
  try {
    const res = await listarControlRevendedor(
      filtros.value.fecha || null,
      filtros.value.idempleado || null,
      filtros.value.idsucursal || null,
      1,
      100000
    );
    const data = res.data || [];
    if (!data.length) {
      showNotification('No hay registros para el día seleccionado', 'error');
      return;
    }

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    let logoOffset = 0;
    try {
      const logo = await getImageBase64PDF(logoMasasCori);
      if (logo) {
        doc.addImage(logo, 'PNG', 14, 8, 26, 26);
        logoOffset = 32;
      }
    } catch (e) { /* sin logo */ }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Control de Personas (Revendedores)', 14 + logoOffset, 18);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Fecha: ${formatoFecha(filtros.value.fecha)}`, 14 + logoOffset, 26);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14 + logoOffset, 32);
    doc.setDrawColor(200);
    doc.line(14, 40, pageW - 14, 40);
    doc.setTextColor(0);

    let startY = 46;

    autoTable(doc, {
      head: [['#', 'Persona', 'Hora', 'Sucursal', 'Total Venta', 'Comisión', 'Gasto Extra', 'Neto a Entregar']],
      body: data.map(c => [
        c.idrevendedorcontrol,
        `${c.Persona?.Nombre || ''} ${c.Persona?.ApellidoPaterno || ''}`.trim(),
        (c.hora || '').slice(0, 5) || '-',
        c.Sucursal?.Nombre || '-',
        formatoBs(c.TotalVenta),
        formatoBs(c.TotalComision),
        formatoBs(c.GastoExtra),
        formatoBs(Number(c.TotalLiquidoPanaderia || 0) - Number(c.GastoExtra || 0))
      ]),
      startY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });
    startY = doc.lastAutoTable.finalY + 8;

    data.forEach(c => {
      if (!c.Detalles?.length) return;
      if (startY + 24 > pageH - 20) { doc.addPage(); startY = 20; }
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(194, 65, 12);
      doc.text(`Detalle ${c.idrevendedorcontrol} - ${c.Persona?.Nombre || ''} ${c.Persona?.ApellidoPaterno || ''}  |  Registro: ${(c.hora || '').slice(0, 5) || '-:-'}`.trim(), 14, startY);
      doc.setTextColor(0);
      startY += 5;

      autoTable(doc, {
        head: [['Producto', 'Presentación', 'Entregado', 'Devuelto', 'P. Venta', 'P. Mayor', 'Comisión', 'Subtotal Ventas', 'Líquido']],
        body: c.Detalles.map(d => [
          d.Producto,
          d.Presentacion,
          String(d.CantidadEntregada),
          String(d.CantidadDevuelta || 0),
          formatoBs(d.PrecioVenta),
          formatoBs(d.PrecioMayor ?? d.PrecioVenta),
          formatoBs(d.ComisionUnitaria),
          formatoBs(d.VentaTotal),
          formatoBs(d.LiquidoPanaderia)
        ]),
        startY,
        styles: { fontSize: 7.5 },
        headStyles: { fillColor: [253, 230, 138], textColor: [120, 53, 15] },
        margin: { left: 14, right: 14 },
        theme: 'striped'
      });
      startY = doc.lastAutoTable.finalY + 8;
      const netoControl = Number(c.TotalLiquidoPanaderia || 0) - Number(c.GastoExtra || 0);
      const netoY = doc.lastAutoTable.finalY + 6;
      if (netoY + 6 > pageH - 20) { doc.addPage(); }
      doc.setFontSize(8.5);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(194, 65, 12);
      doc.text(`Neto a Entregar: ${formatoBs(netoControl)}`, pageW - 14, netoY > pageH - 20 ? 24 : netoY, { align: 'right' });
      doc.setTextColor(0);
      startY = doc.lastAutoTable.finalY + 14;
    });

    const totalVenta = data.reduce((a, c) => a + Number(c.TotalVenta || 0), 0);
    const totalComision = data.reduce((a, c) => a + Number(c.TotalComision || 0), 0);
    const totalGasto = data.reduce((a, c) => a + Number(c.GastoExtra || 0), 0);
    const totalNeto = data.reduce((a, c) => a + (Number(c.TotalLiquidoPanaderia || 0) - Number(c.GastoExtra || 0)), 0);

    autoTable(doc, {
      body: [[
        `TOTAL (${data.length} controles)`,
        `Venta: ${formatoBs(totalVenta)}`,
        `Comisión: ${formatoBs(totalComision)}`,
        `Gasto Extra: ${formatoBs(totalGasto)}`,
        `Neto: ${formatoBs(totalNeto)}`
      ]],
      startY,
      styles: { fontSize: 8, fontStyle: 'bold', fillColor: [254, 243, 199] },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    // Resumen destacado: Líquido total a entregar
    const boxY = doc.lastAutoTable.finalY + 12;
    const boxH = 22;
    doc.setFillColor(249, 115, 22);
    doc.roundedRect(14, boxY, pageW - 28, boxH, 4, 4, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL NETO A ENTREGAR EN GENERAL`, pageW / 2, boxY + 9, { align: 'center' });
    doc.setFontSize(16);
    doc.text(formatoBs(totalNeto), pageW / 2, boxY + 18, { align: 'center' });

    doc.save(`control_revendedor_${filtros.value.fecha}.pdf`);
    showNotification('PDF exportado correctamente');
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    showNotification('Error al exportar PDF', 'error');
  } finally {
    exportandoPDF.value = false;
  }
};

let debounceTimer = null;

// Watchers
watch(tabActiva, (newTab) => {
  if (newTab === 'historial') {
    cargarControles();
  } else if (newTab === 'catalogo') {
    cargarProductosCatalogo();
  }
});

watch([() => filtrosCatalogo.sucursal, () => filtrosCatalogo.categoria, () => filtrosCatalogo.subcategoria], () => {
  paginacionProductos.paginaActual = 1;
  cargarProductosCatalogo();
});

watch(busquedaCatalogo, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    paginacionProductos.paginaActual = 1;
    cargarProductosCatalogo();
  }, 400);
});

onMounted(async () => {
  initializing.value = true;
  try {
    const u = JSON.parse(localStorage.getItem('usuario'));
    if (u && u.IdUsuario) {
      await obtenerSucursalUsuario(u.IdUsuario);
    }
    
    await Promise.all([
      cargarSucursales(),
      cargarCategoriasCatalogo(),
      cargarControles(),
      cargarProductosCatalogo()
    ]);
  } catch (e) {
    console.error('Error onMounted:', e);
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
</style>
