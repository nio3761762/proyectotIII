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
                <Ruler class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Medidas</h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div v-else>

        <!-- Header -->
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Ruler class="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Gestión de Medidas
                </h1>
                <p class="text-gray-600 mt-1 font-medium">Administra las categorías y unidades de medida</p>
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
          <FiltrosMedida
            v-model:search="filtros.search"
            v-model:estado="filtros.estado"
            v-model:limite="filtros.limite"
            @update:search="onSearchChange"
            @update:estado="onEstadoChange"
            @update:limite="onLimiteChange"
          >
            <template #acciones>
              <button
                @click="abrirModalNueva"
                class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Plus class="h-4 w-4" /> Nueva Medida
              </button>
            </template>
          </FiltrosMedida>
        </div>

        <!-- Cards -->
        <div class="relative mt-6">
          <Transition name="fade">
            <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          </Transition>

          <div v-if="!cargando && medidas.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Ruler class="h-10 w-10 text-orange-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron medidas</h3>
            <p class="text-gray-500">Intenta cambiar los filtros o crea una nueva categoría de medida.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <MedidaCard
              v-for="m in medidas"
              :key="m.idcategoriamedida"
              :medida="m"
              @editar="abrirModalEditar"
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
    </Transition>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible"
        class="fixed bottom-6 right-6 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50"
        :class="notificacion.error ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-orange-500 to-red-600'"
      >
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

    <!-- Modal Registrar/Editar -->
    <RegistrarMedida
      :show="modalRegistrar.visible"
      :medida="modalRegistrar.medida"
      :guardando="guardando"
      :todasMedidas="medidas"
      @close="cerrarModalRegistrar"
      @guardar="onGuardar"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Ruler, TrendingUp, Plus, CheckCircle } from 'lucide-vue-next';

import {
  listarMedidas,
  RegistrarCategoriaMedida,
  UpdateCategoriaMedida,
  DeleteCategoriaMedida,
} from '@/Server/Medida';

import FiltrosMedida     from './FiltrosMedida.vue';
import MedidaCard        from './MedidaCard.vue';
import RegistrarMedida   from './RegistrarMedida.vue';
import Paginado          from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion from '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const cargando        = ref(false);
const guardando       = ref(false);
const medidas         = ref([]);

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtros    = reactive({ search: '', estado: '', limite: 8 });
const notificacion = reactive({ visible: false, mensaje: '', error: false });
const modalConfirmacion = reactive({ visible: false, nombre: '', accion: '', medida: null });
const modalRegistrar    = reactive({ visible: false, medida: null });

let debounceTimer = null;

// ── API ────────────────────────────────────────────────────────────────────────
const cargarMedidas = async () => {
  try {
    cargando.value = true;
    const resp = await listarMedidas(
      filtros.search || undefined,
      filtros.estado || undefined,
      paginacion.paginaActual,
      filtros.limite,
    );
    medidas.value           = resp.data       ?? [];
    paginacion.total        = parseInt(resp.total) || 0;
    paginacion.totalPaginas = resp.totalPages  ?? resp.totalPaginas
      ?? (medidas.value.length === filtros.limite ? paginacion.paginaActual + 1 : paginacion.paginaActual);
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar medidas', true);
  } finally {
    cargando.value        = false;
    cargandoInicial.value = false;
  }
};

// ── Filtros ───────────────────────────────────────────────────────────────────
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacion.paginaActual = 1; cargarMedidas(); }, 400);
};
const onEstadoChange  = (val) => { filtros.estado = val; paginacion.paginaActual = 1; cargarMedidas(); };
const onLimiteChange  = (val) => { filtros.limite = val; paginacion.paginaActual = 1; cargarMedidas(); };
const onCambiarPagina = (page) => { paginacion.paginaActual = page; cargarMedidas(); };

// ── Modales registrar/editar ───────────────────────────────────────────────────
const abrirModalNueva  = () => { modalRegistrar.medida = null;     modalRegistrar.visible = true; };
const abrirModalEditar = (m) => { modalRegistrar.medida = { ...m }; modalRegistrar.visible = true; };
const cerrarModalRegistrar = () => { modalRegistrar.visible = false; modalRegistrar.medida = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    const resp = data.IdCategoriaMedida
      ? await UpdateCategoriaMedida(data)
      : await RegistrarCategoriaMedida(data);
    mostrarNotificacion(resp?.message ?? 'Medida guardada');
    cerrarModalRegistrar();
    await cargarMedidas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar la categoría de medida', true);
  } finally {
    guardando.value = false;
  }
};

// ── Modal confirmación ─────────────────────────────────────────────────────────
const abrirModalConfirmacion = (m) => {
  modalConfirmacion.medida  = m;
  modalConfirmacion.nombre  = m.nombre;
  modalConfirmacion.accion  = m.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible = true;
};
const cerrarModalConfirmacion = () => { modalConfirmacion.visible = false; modalConfirmacion.medida = null; };
const onConfirmar = async () => {
  const m = modalConfirmacion.medida;
  cerrarModalConfirmacion();
  if (!m) return;
  try {
    const resp = await DeleteCategoriaMedida(m.idcategoriamedida);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarMedidas();
  } catch { mostrarNotificacion('Error al cambiar el estado', true); }
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje, error = false) => {
  notificacion.mensaje = mensaje; notificacion.error = error; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

onMounted(cargarMedidas);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
