<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading Inicial -->
    <Transition name="fade" mode="out-in">
      <div v-if="cargandoInicial" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto relative mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Package class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando {{ selec === 'Insumo' ? 'Insumos' : 'Productos' }}
          </h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Vista: Formulario Insumo -->
        <RegistrarInsumo
          v-if="modoEdicion && selec === 'Insumo'"
          :insumo="insumoSeleccionado"
          :guardando="guardando"
          :categorias="categorias"
          :categoriaMedidas="categoriaMedidas"
          :todasUnidades="todasLasUnidades"
          @guardar="onGuardar"
          @cancelar="cerrarFormulario"
        />

        <!-- Vista: Formulario Producto -->
        <RegistrarProducto
          v-else-if="modoEdicion && selec === 'Producto'"
          :producto="insumoSeleccionado"
          :guardando="guardando"
          :categorias="categorias"
          :presentaciones="presentaciones"
          @guardar="onGuardarProducto"
          @cancelar="cerrarFormulario"
        />

        <!-- Vista: Listado -->
        <div v-else>

          <!-- Header -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                  <Package class="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de {{ selec === 'Insumo' ? 'Insumos' : 'Productos' }}
                  </h1>
                  <p class="text-gray-600 mt-1 font-medium">Administra tus {{ selec === 'Insumo' ? 'insumos' : 'productos' }}</p>
                </div>
              </div>
              <div class="hidden md:flex items-center space-x-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-800">{{ paginacion.total ?? 0 }}</div>
                  <div class="text-sm text-gray-500">Total</div>
                </div>
                <div class="p-2 bg-green-100 rounded-xl">
                  <TrendingUp class="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros -->
          <div class="mt-6">
            <FiltrosInsumo
              v-model:search="filtros.search"
              v-model:estado="filtros.estado"
              v-model:categoria="filtros.categoria"
              v-model:subcategoria="filtros.subcategoria"
              v-model:limite="filtros.limite"
              :categorias="categorias"
              :subcategorias="subcategoriasParaFiltro"
              @update:categoria="onCategoriaFiltroChange"
            >
              <template #acciones>
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleSelec"
                    class="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-2xl shadow-md border border-gray-100 text-gray-700 hover:bg-white transition-all group"
                  >
                    <component :is="selec === 'Insumo' ? ShoppingBag : Package" class="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span class="font-medium">Ver {{ selec === 'Insumo' ? 'Productos' : 'Insumos' }}</span>
                  </button>

                  <!-- Selector de Vista -->
                  <div class="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
                    <button 
                      @click="vistaModo = 'card'"
                      :class="['p-2 rounded-xl transition-all', vistaModo === 'card' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700']"
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid class="h-4 w-4" />
                    </button>
                    <button 
                      @click="vistaModo = 'table'"
                      :class="['p-2 rounded-xl transition-all', vistaModo === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700']"
                      title="Vista Tabla"
                    >
                      <ListIcon class="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    @click="abrirFormularioNuevo"
                    class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Plus class="h-4 w-4" /> {{ selec === 'Insumo' ? 'Nuevo Insumo' : 'Nuevo Producto' }}
                  </button>
                </div>
              </template>
            </FiltrosInsumo>
          </div>

          <!-- Grid de cards -->
          <div class="relative mt-6">
            <!-- Skeleton Loader -->
            <div v-if="cargando" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div v-for="i in 8" :key="i" class="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 animate-pulse">
                <div class="h-40 bg-gray-100 rounded-2xl w-full"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-50 rounded w-1/2"></div>
                </div>
                <div class="h-8 bg-gray-50 rounded-xl w-full"></div>
                <div class="flex gap-2">
                  <div class="h-9 bg-gray-100 rounded-2xl flex-1"></div>
                  <div class="h-9 bg-gray-100 rounded-2xl w-9"></div>
                </div>
              </div>
            </div>

            <div v-else-if="items.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
              <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Package class="h-10 w-10 text-orange-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron {{ selec === 'Insumo' ? 'insumos' : 'productos' }}</h3>
              <p class="text-gray-500 mb-4">Intenta cambiar los filtros o registra uno nuevo.</p>
              <button v-if="selec === 'Insumo'" @click="abrirFormularioNuevo"
                class="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 mx-auto">
                <Plus class="h-4 w-4" /> Crear Insumo
              </button>
            </div>

            <div v-else>
              <!-- Vista Card -->
              <div v-if="vistaModo === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <template v-if="selec === 'Insumo'">
                  <InsumoCard
                    v-for="insumo in items"
                    :key="insumo.idinsumo"
                    :insumo="insumo"
                    @editar="abrirFormularioEditar"
                    @toggleEstado="abrirModalConfirmacion"
                    @actualizarFoto="abrirModalFoto"
                  />
                </template>
                <template v-else>
                  <ProductoCard
                    v-for="producto in items"
                    :key="producto.idproducto"
                    :producto="producto"
                    @editar="abrirFormularioEditar"
                    @toggleEstado="abrirModalConfirmacion"
                    @actualizarFoto="(p) => mostrarNotificacion('La foto de productos se gestiona en su sección', true)"
                    @administrarReceta="abrirModalIngredientes"
                    @administrarPreciosMayor="abrirModalPreciosMayor"
                  />
                </template>
              </div>

              <!-- Vista Tabla -->
              <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Imagen</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Medidas / Presentaciones</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="item in items" :key="selec === 'Insumo' ? item.idinsumo : item.idproducto" class="hover:bg-orange-50/30 transition-colors group">
                        <!-- Imagen -->
                        <td class="px-6 py-4">
                          <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img v-if="item.imagen || item.Imagen" :src="item.imagen || item.Imagen" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center bg-orange-50">
                              <Package class="h-6 w-6 text-orange-200" />
                            </div>
                          </div>
                        </td>
                        <!-- Info -->
                        <td class="px-6 py-4">
                          <p class="text-sm font-bold text-gray-800">{{ item.nombre || item.Nombre }}</p>
                          <p class="text-xs text-gray-400 line-clamp-1 max-w-xs">{{ item.descripcion || item.Descripcion }}</p>
                        </td>
                        <!-- Categoría -->
                        <td class="px-6 py-4">
                          <span class="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                            {{ item.Subcategoria?.Categoria?.Nombre || item.SubCategoria?.Categoria?.Nombre || 'S/C' }}
                          </span>
                        </td>
                        <!-- Presentaciones / Medidas -->
                        <td class="px-6 py-4">
                          <div v-if="selec === 'Producto'" class="flex flex-col gap-1.5 max-w-xs">
                            <div v-for="pm in (item.Productomedida || item.productomedida || []).filter(pm => (pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado) === 1).slice(0, 3)" :key="pm.IdProductoMedida" 
                              class="text-[10px] bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                              <div class="flex items-center justify-between mb-1">
                                <span class="font-bold text-gray-700 truncate mr-2">{{ pm.Presentacion?.Nombre }}:</span>
                                <span class="text-orange-600 font-bold">Bs {{ pm.PrecioVenta }}</span>
                              </div>
                              <div class="flex items-center justify-between text-[9px]">
                                <span class="text-gray-400">Mayor: Bs {{ pm.PrecioMayor || 0 }}</span>
                                <span v-if="pm.Comision" class="text-green-600 font-medium">Com: Bs {{ pm.Comision }}</span>
                              </div>
                            </div>
                            <span v-if="(item.Productomedida || item.productomedida || []).filter(pm => (pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado) === 1).length > 3" class="text-[10px] text-gray-400 mt-1">
                              +{{ (item.Productomedida || item.productomedida || []).filter(pm => (pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado) === 1).length - 3 }} más...
                            </span>
                            <span v-if="!(item.Productomedida || item.productomedida || []).filter(pm => (pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado) === 1).length" class="text-[10px] text-gray-400 italic">Sin presentaciones activas</span>
                          </div>
                          <div v-else class="flex flex-col gap-1 max-w-xs">
                             <div v-for="m in (item.Insumomedida || []).filter(m => (m.Estado?.idestado ?? m.Estado?.Idestado ?? m.Estado ?? m.idestado) === 1 || m.Estado === 1).slice(0, 3)" :key="m.IdinsumoMedida"
                               class="text-[10px] flex items-center gap-1.5 text-gray-700">
                               <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                               <span class="font-bold">{{ m.Cantidad }}</span>
                               <span>{{ m.Unidadmedida?.Nombre || m.Unidadmedida?.nombre }}</span>
                               <span class="text-gray-400 text-[9px]">({{ m.Unidadmedida?.Abreviatura }})</span>
                             </div>
                             <span v-if="(item.Insumomedida || []).filter(m => (m.Estado?.idestado ?? m.Estado?.Idestado ?? m.Estado ?? m.idestado) === 1 || m.Estado === 1).length > 3" class="text-[10px] text-gray-400">
                              +{{ (item.Insumomedida || []).filter(m => (m.Estado?.idestado ?? m.Estado?.Idestado ?? m.Estado ?? m.idestado) === 1 || m.Estado === 1).length - 3 }} más...
                            </span>
                            <span v-if="!(item.Insumomedida || []).filter(m => (m.Estado?.idestado ?? m.Estado?.Idestado ?? m.Estado ?? m.idestado) === 1 || m.Estado === 1).length" class="text-[10px] text-gray-400 italic">Sin medidas activas</span>
                          </div>
                        </td>
                        <!-- Estado -->
                        <td class="px-6 py-4">
                          <span :class="['px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                            item.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500']">
                            {{ item.estado === 1 ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <!-- Acciones -->
                        <td class="px-6 py-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <button @click="abrirFormularioEditar(item)" class="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-colors" title="Editar">
                              <Pencil class="h-4 w-4" />
                            </button>
                            <template v-if="selec === 'Producto'">
                              <button @click="abrirModalIngredientes(item)" class="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Ingredientes">
                                <Utensils class="h-4 w-4" />
                              </button>
                              <button @click="abrirModalPreciosMayor(item)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Precios Mayor">
                                <Tag class="h-4 w-4" />
                              </button>
                            </template>
                            <button @click="abrirModalConfirmacion(item)" 
                              :class="['p-2 rounded-xl transition-colors', item.estado === 1 ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50']"
                              :title="item.estado === 1 ? 'Desactivar' : 'Activar'">
                              <component :is="item.estado === 1 ? ToggleRight : ToggleLeft" class="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <Paginado
              :paginaActual="paginacion.paginaActual"
              :totalPaginas="paginacion.totalPaginas"
              :total="paginacion.total"
              :limite="filtros.limite"
              @update:paginaActual="onCambiarPagina"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible"
        class="fixed bottom-6 right-6 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50"
        :class="notificacion.error ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-orange-500 to-red-600'">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>

    <!-- Modal Confirmación -->
    <ModalConfirmacion
      :show="modalConfirmacion.visible"
      :mensaje="modalConfirmacion.accion"
      :nombreUsuario="modalConfirmacion.nombre"
      @confirmar="onConfirmar"
      @cancelar="cerrarModalConfirmacion"
    />

    <!-- Modal Foto -->
    <ModalFotoInsumo
      :show="modalFoto.visible"
      :nombreInsumo="modalFoto.nombre"
      :imagenActual="modalFoto.imagen"
      :subiendo="modalFoto.subiendo"
      @close="modalFoto.visible = false"
      @guardar="onGuardarFoto"
    />

    <!-- Modal Administrar Ingredientes -->
    <AdministrarIngredientes
      :show="showIngredienteModal"
      :product="productoParaIngredientes"
      :guardando="guardandoIngredientes"
      :all-insumos="allInsumos"
      :categoria-medidas="categoriaMedidas"
      :todas-las-unidades="todasLasUnidades"
      @close="showIngredienteModal = false"
      @guardar="onGuardarIngredientes"
    />

    <!-- Modal Administrar Precios Mayor -->
    <AdministrarPreciosMayor
      :show="showPreciosMayorModal"
      :product="productoParaPrecios"
      :guardando="guardandoPreciosMayor"
      @close="showPreciosMayorModal = false"
      @guardar="onGuardarPreciosMayor"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Package, TrendingUp, Plus, CheckCircle, ShoppingBag, LayoutGrid, List as ListIcon, Pencil, ToggleLeft, ToggleRight, Utensils, Tag } from 'lucide-vue-next';

import { listarInsumos, crearInsumo, actualizarInsumo, eliminarInsumo, AgregarPhotoInsumo, ListInsumo } from '@/Server/Insumo';
import { listarProductos, DeleteProducto, addProducto, updateProducto, updateCreatePrecioProducto }    from '@/Server/Producto';

import { listCategorias, ObtenerSubCategorias }                            from '@/Server/Categoria';
import { listarCategoriaMedidas, ObtenerMedidas }                          from '@/Server/Medida';
import { SubirFoto }                                                       from '@/Server/api';
import {  registrarProduccionDeProducto, actualizarIngredienteReceta } from '@/Server/Ingrediente';
import { listarPresentacionesestado } from '@/Server/Presentacion';

import FiltrosInsumo           from './FiltrosInsumo.vue';
import InsumoCard              from './InsumoCard.vue';
import ProductoCard            from './Producto/ProductoCard.vue';
import RegistrarInsumo         from './RegistrarInsumo.vue';
import RegistrarProducto        from './Producto/RegistrarProducto.vue';
import ModalFotoInsumo         from './ModalFotoInsumo.vue';
import AdministrarIngredientes   from './Producto/AdministrarIngredientes.vue';
import AdministrarPreciosMayor from './Producto/AdministrarPreciosMayor.vue';
import Paginado                from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion       from '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial  = ref(true);
const cargando         = ref(false);
const guardando        = ref(false);
const modoEdicion      = ref(false);
const selec            = ref('Insumo');
const vistaModo        = ref('card'); // 'card' o 'table'
const insumoSeleccionado = ref(null);
const items            = ref([]);
const categorias       = ref([]);
const categoriaMedidas = ref([]);
const subcategoriasParaFiltro = ref([]);
const allInsumos       = ref([]);
const presentaciones   = ref([]);
const todasLasUnidades = ref([]);

const paginacion   = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtros      = reactive({ search: '', estado: -1, categoria: '', subcategoria: '', limite: 8 });
const notificacion = reactive({ visible: false, mensaje: '', error: false });
const modalConfirmacion = reactive({ visible: false, nombre: '', accion: '', item: null });
const modalFoto    = reactive({ visible: false, nombre: '', imagen: '', item: null, subiendo: false });

const showIngredienteModal     = ref(false);
const productoParaIngredientes = ref(null);
const guardandoIngredientes    = ref(false);

const showPreciosMayorModal     = ref(false);
const productoParaPrecios       = ref(null);
const guardandoPreciosMayor     = ref(false);

// ── Estado de control de peticiones ───────────────────────────────────────────
let requestId       = 0;
let debounceTimer   = null;

onUnmounted(() => {
  clearTimeout(debounceTimer);
});

// ── ÚNICO punto que llama cargarDatos: el watch ───────────────────────────────
// Watch unificado para filtros y selección
watch(
  [
    () => filtros.search,
    () => filtros.estado,
    () => filtros.categoria,
    () => filtros.subcategoria,
    () => filtros.limite,
    () => selec.value,
    () => paginacion.paginaActual
  ],
  (newValues, oldValues) => {
    // Si cambió cualquier filtro que no sea la página, resetear a página 1
    const [search, estado, cat, sub, lim, sel, pag] = newValues;
    const [oSearch, oEstado, oCat, oSub, oLim, oSel, oPag] = oldValues || [];

    if (pag !== 1 && (search !== oSearch || estado !== oEstado || cat !== oCat || sub !== oSub || lim !== oLim || sel !== oSel)) {
      paginacion.paginaActual = 1;
      // Este cambio disparará el watch de nuevo, así que retornamos
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(cargarDatos, 300);
  },
  { immediate: false }
);

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [catRes, catMedRes, insumoRes,presRes] = await Promise.all([
      listCategorias().catch(() => []),
      listarCategoriaMedidas().catch(() => []),
      ListInsumo().catch(() => []),
      listarPresentacionesestado().catch(()=>[]),
    ]);
    categorias.value       = catRes?.result       ?? catRes       ?? [];
    categoriaMedidas.value = catMedRes?.result    ?? catMedRes    ?? [];
    allInsumos.value       = insumoRes?.result    ?? insumoRes    ?? [];
    presentaciones.value   = presRes?.result      ?? presRes      ?? [];

    const responses = await Promise.all(
      categoriaMedidas.value.map(cat => ObtenerMedidas(cat.idcategoriamedida).catch(() => []))
    );
    todasLasUnidades.value = responses.flatMap(r => r.result ?? r ?? []);

    // Llamada inicial
    await cargarDatos();
  } catch (err) {
    console.error('Error en onMounted:', err);
    mostrarNotificacion('Error al cargar datos iniciales', true);
  } finally {
    cargandoInicial.value = false;
  }
});

// ── cargarDatos ───────────────────────────────────────────────────────────────
const cargarDatos = async () => {
  const currentRequestId = ++requestId;
  cargando.value = true;
  


  try {
    const fetchMethod = selec.value === 'Insumo' ? listarInsumos : listarProductos;

    const resp = await fetchMethod(
      filtros.search || undefined,
      filtros.estado,
      filtros.categoria || undefined,
      filtros.subcategoria || undefined,
      paginacion.paginaActual,
      filtros.limite
    );

    // Solo actualizar si esta es la petición más reciente
    if (currentRequestId === requestId) {
      if (resp) {
        items.value             = resp.data ?? [];
        paginacion.total        = parseInt(resp.total) || 0;
        paginacion.totalPaginas = resp.totalPages ?? Math.ceil(paginacion.total / filtros.limite);
      
      }
    } else {
      console.warn(`[CargarDatos] Descartada respuesta #${currentRequestId} (Ya no es la última)`);
    }

  } catch (err) {
    if (currentRequestId === requestId) {
   
      mostrarNotificacion('Error al cargar datos', true);
    }
  } finally {
    if (currentRequestId === requestId) {
      cargando.value = false;
    
    }
  }
};

// ── Cambio de modo (Insumo ↔ Producto) ───────────────────────────────────────
// NO llama cargarDatos directamente — el watch de selec/filtros lo hará
const toggleSelec = () => {
  // Pausar el watch momentáneamente acumulando todos los cambios en un solo tick
  selec.value          = selec.value === 'Insumo' ? 'Producto' : 'Insumo';
  filtros.search       = '';
  filtros.categoria    = '';
  filtros.subcategoria = '';
  filtros.estado       = -1;
  filtros.limite       = filtros.limite; // sin cambio, solo para no omitirlo
  subcategoriasParaFiltro.value = [];
  // paginaActual ya se resetea dentro del watch de filtros si es != 1
};

// ── Filtros ───────────────────────────────────────────────────────────────────
const onCategoriaFiltroChange = async (val) => {
  // LIMPIEZA: El v-model ya cambió filtros.categoria y eso disparará el watch principal.
  filtros.subcategoria          = '';
  subcategoriasParaFiltro.value = [];

  if (val) {
    try {
      const r = await ObtenerSubCategorias(val);
      subcategoriasParaFiltro.value = r.result ?? r ?? [];
    } catch (err) {
      console.error('Error al cargar subcategorías:', err);
    }
  }
  
  if (paginacion.paginaActual !== 1) {
    paginacion.paginaActual = 1;
  }
};

const onCambiarPagina = (page) => {
  paginacion.paginaActual = page; // el watch de paginaActual se encarga
};

// ── Formulario Insumo ─────────────────────────────────────────────────────────
const abrirFormularioNuevo  = () => { insumoSeleccionado.value = null; modoEdicion.value = true; };
const abrirFormularioEditar = (item) => { insumoSeleccionado.value = { ...item }; modoEdicion.value = true; };
const cerrarFormulario      = () => { modoEdicion.value = false; insumoSeleccionado.value = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    const resp = data.idinsumo
      ? await actualizarInsumo({ ...data, id: data.idinsumo })
      : await crearInsumo(data);
    mostrarNotificacion(resp?.message ?? 'Insumo guardado');
    cerrarFormulario();
    await cargarDatos(); // refrescar lista después de guardar
  } catch (err) {
    mostrarNotificacion('Error al guardar el insumo', true);
  } finally {
    guardando.value = false;
  }
};

// ── Guardar Producto ─────────────────────────────────────────────────────────
const onGuardarProducto = async (data) => {
  guardando.value = true;
  try {
    const resp = data.idproducto
      ? await updateProducto({ ...data, id: data.idproducto })
      : await addProducto(data);
    mostrarNotificacion(resp?.message ?? 'Producto guardado');
    cerrarFormulario();
    await cargarDatos();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar el producto', true);
  } finally {
    guardando.value = false;
  }
};

// ── Modal confirmación ────────────────────────────────────────────────────────
const abrirModalConfirmacion = (item) => {
  modalConfirmacion.item    = item;
  modalConfirmacion.nombre  = item.nombre;
  modalConfirmacion.accion  = item.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible = true;
};
const cerrarModalConfirmacion = () => { modalConfirmacion.visible = false; modalConfirmacion.item = null; };

const onConfirmar = async () => {
  const item = modalConfirmacion.item;
  cerrarModalConfirmacion();
  if (!item) return;
  try {
    const id   = selec.value === 'Insumo' ? item.idinsumo : item.idproducto;
    const resp = selec.value === 'Insumo'
      ? await eliminarInsumo(id)
      : await DeleteProducto(id);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarDatos(); // refrescar lista después de cambiar estado
  } catch {
    mostrarNotificacion('Error al cambiar el estado', true);
  }
};

// ── Modal Foto ────────────────────────────────────────────────────────────────
const abrirModalFoto = (item) => {
  Object.assign(modalFoto, { visible: true, item, nombre: item.nombre, imagen: item.imagen ?? '', subiendo: false });
};

const onGuardarFoto = async (archivo) => {
  modalFoto.subiendo = true;
  try {
    const url = await SubirFoto(archivo);
    await AgregarPhotoInsumo(modalFoto.item.idinsumo, url);
    mostrarNotificacion('Foto actualizada');
    modalFoto.visible = false;
    await cargarDatos();
  } catch {
    mostrarNotificacion('Error al subir la imagen', true);
  } finally {
    modalFoto.subiendo = false;
  }
};

// ── Modal Ingredientes ────────────────────────────────────────────────────────
const abrirModalIngredientes = (producto) => {
  productoParaIngredientes.value = producto.Producto ? producto : { Producto: producto };
  showIngredienteModal.value = true;
};

const onGuardarIngredientes = async (payload) => {
  guardandoIngredientes.value = true;
  try {
    const resp = payload.idReceta
      ? await actualizarIngredienteReceta(payload.idReceta, payload.data)
      : await registrarProduccionDeProducto(payload.data);
    
    mostrarNotificacion(resp?.message ?? 'Receta guardada con éxito');
    showIngredienteModal.value = false;
  } catch (err) {
    console.error(err);
    mostrarNotificacion(err.response?.data?.message ?? 'Error al guardar receta', true);
  } finally {
    guardandoIngredientes.value = false;
  }
};

// ── Modal Precios Mayor ───────────────────────────────────────────────────────
const abrirModalPreciosMayor = (producto) => {
  productoParaPrecios.value = producto;
  showPreciosMayorModal.value = true;
};

const onGuardarPreciosMayor = async (payload) => {
  guardandoPreciosMayor.value = true;
  try {
  
    const resp = await updateCreatePrecioProducto(payload);
    mostrarNotificacion(resp?.message ?? 'Precios actualizados con éxito');
    showPreciosMayorModal.value = false;
    await cargarDatos();
  } catch (err) {
    console.error(err);
    mostrarNotificacion(err.response?.data?.message ?? 'Error al guardar precios', true);
  } finally {
    guardandoPreciosMayor.value = false;
  }
}; 

// ── Utilidades ────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje, error = false) => {
  notificacion.mensaje = mensaje;
  notificacion.error   = error;
  notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
