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
                <DollarSign class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Comisiones</h3>
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
                <DollarSign class="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Gestión de Comisiones
                </h1>
                <p class="text-gray-600 mt-1 font-medium">Administra las comisiones del sistema</p>
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
          <FiltrosComision
            v-model:search="filtros.search"
            v-model:estado="filtros.estado"
            v-model:idproducto="filtros.idproducto"
            v-model:limite="filtros.limite"
            :productos="productosParaFiltro"
            @update:search="onSearchChange"
            @update:estado="onFiltroChange"
            @update:idproducto="onFiltroChange"
            @update:limite="onLimiteChange"
          >
            <template #acciones>
              <button
                @click="abrirModalNueva"
                class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Plus class="h-4 w-4" /> Nueva Comisión
              </button>
            </template>
          </FiltrosComision>
        </div>

        <!-- Grid de cards -->
        <div class="relative mt-6">
          <Transition name="fade">
            <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          </Transition>

          <!-- Empty state -->
          <div v-if="!cargando && comisiones.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <DollarSign class="h-10 w-10 text-orange-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron comisiones</h3>
            <p class="text-gray-500">Intenta cambiar los filtros o crea una nueva comisión.</p>
          </div>

          <!-- Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComisionCard
              v-for="comision in comisiones"
              :key="comision.idcomision"
              :comision="comision"
              @editar="abrirModalEditar"
              @toggleEstado="abrirModalConfirmacion"
            />
          </div>

          <!-- Paginación -->
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

    <!-- Modal Registrar/Editar -->
    <RegistrarComision
      :show="modalRegistrar.visible"
      :comision="modalRegistrar.comision"
      :guardando="guardando"
      :productosMedidas="productosMedidas"
      @close="cerrarModalRegistrar"
      @guardar="onGuardar"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { DollarSign, TrendingUp, Plus, CheckCircle } from 'lucide-vue-next';

import { listarComisiones, AddComisiones, UpdateComision, DeleteComision } from '@/Server/Comision';
import { listProductMedida, listProduct }                         from '@/Server/Producto';

import FiltrosComision  from './FiltrosComision.vue';
import ComisionCard     from './ComisionCard.vue';
import RegistrarComision from './RegistrarComision.vue';
import Paginado         from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion from '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const cargando        = ref(false);
const guardando       = ref(false);
const comisiones      = ref([]);
const productosMedidas = ref([]);      // lista para el Combobox del modal
const productosParaFiltro = ref([]);  // lista simplificada para el filtro

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtros    = reactive({ search: '', estado: -1, idproducto: '', limite: 8 });
const notificacion = reactive({ visible: false, mensaje: '', error: false });
const modalConfirmacion = reactive({ visible: false, nombre: '', accion: '', comision: null });
const modalRegistrar    = reactive({ visible: false, comision: null });

let debounceTimer = null;

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    // Cargar productosMedidas y productos simples en paralelo
    const [pmRes, prodRes] = await Promise.all([
      listProductMedida().catch(() => []),
      listProduct().catch(() => []),
    ]);

    // listProductMedida devuelve array plano con estructura minúsculas
    productosMedidas.value = Array.isArray(pmRes) ? pmRes : (pmRes?.result ?? pmRes?.data ?? []);
    // listProduct devuelve [{ idproducto, nombre, ... }]
    productosParaFiltro.value = Array.isArray(prodRes) ? prodRes : (prodRes?.result ?? prodRes?.data ?? []);

    await cargarComisiones();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar datos iniciales', true);
  } finally {
    cargandoInicial.value = false;
  }
});

// ── API ────────────────────────────────────────────────────────────────────────
const cargarComisiones = async () => {
  try {
    cargando.value = true;
    const resp = await listarComisiones(
      filtros.idproducto || undefined,
      filtros.estado,
      filtros.search     || undefined,
      paginacion.paginaActual,
      filtros.limite,
    );
    comisiones.value        = resp.data       ?? [];
    paginacion.total        = parseInt(resp.total) || 0;
    paginacion.totalPaginas = resp.totalPages  ?? resp.totalPaginas
      ?? (comisiones.value.length === filtros.limite ? paginacion.paginaActual + 1 : paginacion.paginaActual);
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar comisiones', true);
  } finally {
    cargando.value = false;
  }
};

// ── Filtros ───────────────────────────────────────────────────────────────────
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacion.paginaActual = 1; cargarComisiones(); }, 400);
};
const onFiltroChange  = () => { paginacion.paginaActual = 1; cargarComisiones(); };
const onLimiteChange  = (val) => { filtros.limite = val; paginacion.paginaActual = 1; cargarComisiones(); };
const onCambiarPagina = (page) => { paginacion.paginaActual = page; cargarComisiones(); };

// ── Modales Registrar/Editar ───────────────────────────────────────────────────
const abrirModalNueva   = () => { modalRegistrar.comision = null;    modalRegistrar.visible = true; };
const abrirModalEditar  = (c) => { modalRegistrar.comision = { ...c }; modalRegistrar.visible = true; };
const cerrarModalRegistrar = () => { modalRegistrar.visible = false; modalRegistrar.comision = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    // Payload que espera el backend: { Registrar: { Nombre, IdProducto, Cantidad, Porcentaje, Preciocomision } }
    const payload = {
      Nombre:         data.Nombre,
      IdProducto:     data.IdProducto,
      Cantidad:       data.Cantidad,
      Porcentaje:     data.Porcentaje,
      Preciocomision: data.Preciocomision,
    };

    const resp = data.IdComision
      ? await UpdateComision({ ...payload, IdComision: data.IdComision })
      : await AddComisiones(payload);

    mostrarNotificacion(resp?.message ?? 'Comisión guardada');
    cerrarModalRegistrar();
    await cargarComisiones();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar la comisión', true);
  } finally {
    guardando.value = false;
  }
};

// ── Modal Confirmación ─────────────────────────────────────────────────────────
const abrirModalConfirmacion = (c) => {
  modalConfirmacion.comision = c;
  modalConfirmacion.nombre   = c.nombre;
  modalConfirmacion.accion   = c.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible  = true;
};
const cerrarModalConfirmacion = () => { modalConfirmacion.visible = false; modalConfirmacion.comision = null; };

const onConfirmar = async () => {
  const c = modalConfirmacion.comision;
  cerrarModalConfirmacion();
  if (!c) return;
  try {
    const resp = await DeleteComision(c.idcomision);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarComisiones();
  } catch { mostrarNotificacion('Error al cambiar el estado', true); }
};

// ── Utilidades ────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje, error = false) => {
  notificacion.mensaje = mensaje; notificacion.error = error; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
