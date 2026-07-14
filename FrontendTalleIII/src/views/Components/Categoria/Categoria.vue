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
                <Tags class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Categorías</h3>
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
                <Tags class="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Gestión de Categorías
                </h1>
                <p class="text-gray-600 mt-1 font-medium">Administra las categorías y subcategorías</p>
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
          <FiltrosCategoria
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
                <Plus class="h-4 w-4" /> Nueva Categoría
              </button>
            </template>
          </FiltrosCategoria>
        </div>

        <!-- Cards -->
        <div class="relative mt-6">
          <Transition name="fade">
            <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          </Transition>

          <div v-if="!cargando && categorias.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Tags class="h-10 w-10 text-orange-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron categorías</h3>
            <p class="text-gray-500">Intenta cambiar los filtros o crea una nueva categoría.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CategoriaCard
              v-for="cat in categorias"
              :key="cat.idcategoria"
              :categoria="cat"
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

    <!-- Notificación toast -->
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

    <!-- Modal Registrar/Editar -->
    <RegistrarCategoria
      :show="modalRegistrar.visible"
      :categoria="modalRegistrar.categoria"
      :guardando="guardando"
      :todasCategorias="categorias"
      @close="cerrarModalRegistrar"
      @guardar="onGuardar"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Tags, TrendingUp, Plus, CheckCircle } from 'lucide-vue-next';

import {
  listarCategorias, RegistrarCategoria as apiRegistrar,
  UpdateCategoria, DeleteCategoria
} from '@/Server/Categoria';

import FiltrosCategoria  from './FiltrosCategoria.vue';
import CategoriaCard     from './CategoriaCard.vue';
import RegistrarCategoria from './RegistrarCategoria.vue';
import Paginado          from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion from '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const cargando        = ref(false);
const guardando       = ref(false);
const categorias      = ref([]);

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtros    = reactive({ search: '', estado: '-1', limite: 8 });
const notificacion       = reactive({ visible: false, mensaje: '' });
const modalConfirmacion  = reactive({ visible: false, nombre: '', accion: '', categoria: null });
const modalRegistrar     = reactive({ visible: false, categoria: null });

let debounceTimer = null;

// ── API ────────────────────────────────────────────────────────────────────────
const cargarCategorias = async () => {
  try {
    cargando.value = true;
    const estadoParam = filtros.estado === '-1' ? undefined : filtros.estado;
    const resp = await listarCategorias(
      filtros.search || undefined,
      estadoParam,
      paginacion.paginaActual,
      filtros.limite,
    );

    categorias.value        = resp.data       ?? [];
    paginacion.total        = Number(resp.total       ?? 0);
    paginacion.totalPaginas = Number(resp.totalPages  ?? resp.totalPaginas
      ?? (categorias.value.length === filtros.limite ? paginacion.paginaActual + 1 : paginacion.paginaActual));
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar categorías');
  } finally {
    cargando.value        = false;
    cargandoInicial.value = false;
  }
};

// ── Filtros ────────────────────────────────────────────────────────────────────
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacion.paginaActual = 1; cargarCategorias(); }, 400);
};
const onEstadoChange  = (val) => { filtros.estado = val; paginacion.paginaActual = 1; cargarCategorias(); };
const onLimiteChange  = (val) => { filtros.limite = val; paginacion.paginaActual = 1; cargarCategorias(); };
const onCambiarPagina = (page) => { paginacion.paginaActual = page; cargarCategorias(); };

// ── Modales registrar/editar ───────────────────────────────────────────────────
const abrirModalNueva  = () => { modalRegistrar.categoria = null;    modalRegistrar.visible = true; };
const abrirModalEditar = (cat) => { modalRegistrar.categoria = { ...cat }; modalRegistrar.visible = true; };
const cerrarModalRegistrar = () => { modalRegistrar.visible = false; modalRegistrar.categoria = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    const payload = {
      IdCategoria: data.idcategoria,
      Nombre:      data.nombre,
      Url:         data.imagen,
      Subcategoria: data.subcategorias.map(s => ({
        ...(s.idsubcategoria ? { IdSubCategoria: s.idsubcategoria } : {}),
        Nombre:   s.nombre,
        IdEstado: s.idestado,
      })),
    };

    const resp = data.idcategoria
      ? await UpdateCategoria({ ...payload })
      : await apiRegistrar(payload);

    mostrarNotificacion(resp?.message ?? 'Categoría guardada');
    cerrarModalRegistrar();
    await cargarCategorias();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar la categoría');
  } finally {
    guardando.value = false;
  }
};

// ── Modal confirmación ─────────────────────────────────────────────────────────
const abrirModalConfirmacion = (cat) => {
  modalConfirmacion.categoria = cat;
  modalConfirmacion.nombre    = cat.nombre;
  modalConfirmacion.accion    = cat.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible   = true;
};
const cerrarModalConfirmacion = () => { modalConfirmacion.visible = false; modalConfirmacion.categoria = null; };
const onConfirmar = async () => {
  const cat = modalConfirmacion.categoria;
  cerrarModalConfirmacion();
  if (!cat) return;
  try {
    const resp = await DeleteCategoria(cat.idcategoria);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarCategorias();
  } catch (err) { mostrarNotificacion('Error al cambiar el estado'); }
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

onMounted(cargarCategorias);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
