<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading -->
    <Transition name="fade" mode="out-in">
      <div v-if="cargandoInicial" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto relative mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Building2 class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Sucursales</h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Formulario -->
        <RegistrarSucursal
          v-if="modoEdicion"
          :sucursal="sucursalSeleccionada"
          :guardando="guardando"
          @guardar="onGuardar"
          @cancelar="cerrarFormulario"
        />

        <!-- Listado -->
        <div v-else>

          <!-- Header -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                  <Building2 class="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de Sucursales
                  </h1>
                  <p class="text-gray-600 mt-1 font-medium">Administra todas las sucursales</p>
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
            <FiltrosSucursal
              v-model:search="filtros.search"
              v-model:estado="filtros.estado"
              v-model:limite="filtros.limite"
              @update:search="onSearchChange"
              @update:estado="onEstadoChange"
              @update:limite="onLimiteChange"
            >
              <template #acciones>
                <button
                  @click="abrirFormularioNuevo"
                  class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus class="h-4 w-4" /> Nueva Sucursal
                </button>
              </template>
            </FiltrosSucursal>
          </div>

          <!-- Cards -->
          <div class="relative mt-6">
            <Transition name="fade">
              <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            </Transition>

            <div v-if="!cargando && sucursales.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
              <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building2 class="h-10 w-10 text-orange-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron sucursales</h3>
              <p class="text-gray-500">Intenta cambiar los filtros o registra una nueva sucursal.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <SucursalCard
                v-for="s in sucursales"
                :key="s.idsucursal"
                :sucursal="s"
                @editar="abrirFormularioEditar"
                @asignarUsuario="abrirModalAsignacion"
                @gestionarHornos="abrirModalHornos"
                @gestionarGastos="abrirModalGastos"
                @toggleEstado="abrirModalConfirmacion"
              />
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

    <!-- Notificación -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible" class="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50">
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

    <!-- Modal Asignar Usuario -->
    <AsignarUsuario
      :show="modalAsignacion.visible"
      :sucursal="modalAsignacion.sucursal"
      :empleadosDisponibles="modalAsignacion.empleados"
      :empleadosAsignados="modalAsignacion.asignados"
      @close="cerrarModalAsignacion"
      @toggle-asignacion="toggleAsignacion"
      @guardar="guardarAsignacion"
    />

    <!-- Modal Gestionar Hornos -->
    <GestionHornos
      :show="modalHornos.visible"
      :sucursal="modalHornos.sucursal"
      @close="cerrarModalHornos"
      @updated="mostrarNotificacion"
    />

    <!-- Modal Gestionar Gastos -->
    <GestionGastos
      :show="modalGastos.visible"
      :sucursal="modalGastos.sucursal"
      @close="cerrarModalGastos"
      @updated="mostrarNotificacion"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Building2, TrendingUp, Plus, CheckCircle } from 'lucide-vue-next';
import { listarSucursales, addSucursal, UpdateSucursal, DelSucursal } from '@/Server/api';
import { getEmpleadosSinSucursal, listarEmpleadosAsignadosSucursal, asignarEmpleadosSucursal } from '@/Server/EmpleadoSucursal';

import FiltrosSucursal  from './FiltrosSucursal.vue';
import SucursalCard     from './SucursalCard.vue';
import RegistrarSucursal from './RegistrarSucursal.vue';
import AsignarUsuario   from './AsignarUsuario.vue';
import GestionHornos    from './GestionHornos.vue';
import GestionGastos    from './GestionGastos.vue';
import Paginado         from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion from '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial    = ref(true);
const cargando           = ref(false);
const guardando          = ref(false);
const modoEdicion        = ref(false);
const sucursalSeleccionada = ref(null);
const sucursales         = ref([]);

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtros    = reactive({ search: '', estado: '-1', limite: 8 });
const notificacion = reactive({ visible: false, mensaje: '' });
const modalConfirmacion = reactive({ visible: false, nombre: '', accion: '', sucursal: null });
const modalAsignacion   = reactive({ visible: false, sucursal: null, empleados: [], asignados: [], asignadosOriginal: [] });
const modalHornos       = reactive({ visible: false, sucursal: null });
const modalGastos       = reactive({ visible: false, sucursal: null });

let debounceTimer = null;

// ── API ────────────────────────────────────────────────────────────────────────
const cargarSucursales = async () => {
  try {
    cargando.value = true;
    const estadoParam = filtros.estado === '-1' ? undefined : filtros.estado;
    const resp = await listarSucursales(filtros.search || undefined, estadoParam, paginacion.paginaActual, filtros.limite);
    sucursales.value        = resp.data      ?? [];
    paginacion.total        = resp.total     ?? 0;
    paginacion.totalPaginas = resp.totalPages ?? resp.totalPaginas
      ?? (sucursales.value.length === filtros.limite ? paginacion.paginaActual + 1 : paginacion.paginaActual);
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar sucursales');
  } finally {
    cargando.value        = false;
    cargandoInicial.value = false;
  }
};

// ── Filtros ────────────────────────────────────────────────────────────────────
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacion.paginaActual = 1; cargarSucursales(); }, 400);
};
const onEstadoChange = (val) => { filtros.estado = val; paginacion.paginaActual = 1; cargarSucursales(); };
const onLimiteChange = (val) => { filtros.limite = val; paginacion.paginaActual = 1; cargarSucursales(); };
const onCambiarPagina = (page) => { paginacion.paginaActual = page; cargarSucursales(); };

// ── Formulario ─────────────────────────────────────────────────────────────────
const abrirFormularioNuevo  = () => { sucursalSeleccionada.value = null; modoEdicion.value = true; };
const abrirFormularioEditar = (s) => { sucursalSeleccionada.value = { ...s }; modoEdicion.value = true; };
const cerrarFormulario      = () => { modoEdicion.value = false; sucursalSeleccionada.value = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    const resp = data.idsucursal
      ? await UpdateSucursal({ ...data, id: data.idsucursal })
      : await addSucursal(data);
    mostrarNotificacion(resp?.message ?? 'Sucursal guardada');
    cerrarFormulario();
    await cargarSucursales();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar');
  } finally {
    guardando.value = false;
  }
};

// ── Modal confirmación ─────────────────────────────────────────────────────────
const abrirModalConfirmacion = (s) => {
  modalConfirmacion.sucursal = s;
  modalConfirmacion.nombre   = s.nombre;
  modalConfirmacion.accion   = s.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible  = true;
};
const cerrarModalConfirmacion = () => { modalConfirmacion.visible = false; modalConfirmacion.sucursal = null; };
const onConfirmar = async () => {
  const s = modalConfirmacion.sucursal;
  cerrarModalConfirmacion(); 
  if (!s) return;
  try {
    const resp = await DelSucursal(s.idsucursal);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarSucursales();
  } catch (err) { mostrarNotificacion('Error al cambiar estado'); }
};

// ── Modal asignación ───────────────────────────────────────────────────────────
const abrirModalAsignacion = async (s) => {
  try {
    const [todos, respAsignados] = await Promise.all([
      getEmpleadosSinSucursal(),
      listarEmpleadosAsignadosSucursal(s.idsucursal)
    ]); 

    const yaAsignados = respAsignados?.empleados?.filter(e => e.estado === 1) ?? [];

    const unicos = [...todos, ...yaAsignados].reduce((acc, e) => {
      const id = e.idempleado;
      if (id && !acc.some(x => x.idempleado === id)) acc.push(e);
      return acc;
    }, []);

    Object.assign(modalAsignacion, {
      visible:           true,
      sucursal:          s,
      empleados:         unicos,
      asignados:         yaAsignados.map(e => ({ id: e.idempleado })),
      asignadosOriginal: yaAsignados.map(e => ({ id: e.idempleado })),
    });
  } catch (err) { 
    console.error(err);
    mostrarNotificacion('Error al cargar empleados'); 
  }
};
const cerrarModalAsignacion = () => {
  Object.assign(modalAsignacion, { visible: false, sucursal: null, empleados: [], asignados: [], asignadosOriginal: [] });
};
const toggleAsignacion = (id) => {
  const idx = modalAsignacion.asignados.findIndex(u => u.id === id);
  if (idx > -1) modalAsignacion.asignados.splice(idx, 1);
  else modalAsignacion.asignados.push({ id });
};
const guardarAsignacion = async () => {
  const s = modalAsignacion.sucursal;
  const asignados = [...modalAsignacion.asignados];
  cerrarModalAsignacion();
  try {
    const resp = await asignarEmpleadosSucursal(s.idsucursal, asignados);
    mostrarNotificacion(resp?.message ?? 'Asignación guardada');
  } catch (err) { mostrarNotificacion('Error al guardar asignación'); }
};

// ── Modal Hornos ───────────────────────────────────────────────────────────────
const abrirModalHornos = (s) => {
  modalHornos.sucursal = s;
  modalHornos.visible = true;
};
const cerrarModalHornos = () => {
  modalHornos.visible = false;
  modalHornos.sucursal = null;
};

// ── Modal Gastos ───────────────────────────────────────────────────────────────
const abrirModalGastos = (s) => {
  modalGastos.sucursal = s;
  modalGastos.visible = true;
};
const cerrarModalGastos = () => {
  modalGastos.visible = false;
  modalGastos.sucursal = null;
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

onMounted(cargarSucursales);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
