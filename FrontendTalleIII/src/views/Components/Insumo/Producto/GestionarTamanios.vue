<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="$emit('cerrar')"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative flex-shrink-0">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Ruler class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">Gestión de Tamaños</h2>
              <p class="text-orange-100 text-sm font-medium">Administra los tamaños para las variantes de producto</p>
            </div>
          </div>
          <button
            @click="$emit('cerrar')"
            class="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-grow p-6 space-y-5">
          <!-- Filtros -->
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-semibold text-gray-500 mb-1 block">Buscar</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  :value="filtros.search"
                  @input="onSearch($event.target.value)"
                  placeholder="Buscar por nombre..."
                  class="w-full pl-9 pr-4 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-700 placeholder:text-gray-400 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-gray-500 mb-1 block">Estado</label>
              <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
                <button
                  v-for="op in estadoOpciones" :key="op.value"
                  @click="onEstado(op.value)"
                  :class="['px-3 py-1.5 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5',
                    filtros.estado === op.value ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
                >
                  <div :class="['w-1.5 h-1.5 rounded-full', op.color]"></div>
                  {{ op.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Formulario agregar/editar -->
          <div class="bg-orange-50/60 rounded-2xl p-4 space-y-3">
            <p class="text-sm font-semibold text-orange-700 flex items-center gap-1.5">
              <component :is="editando ? Pencil : Plus" class="h-3.5 w-3.5" />
              {{ editando ? 'Editando tamaño' : 'Nuevo tamaño' }}
            </p>
            <div class="flex gap-2">
              <input
                v-model="form.nombre"
                @keyup.enter="guardar"
                :class="inputClass"
                :placeholder="editando ? 'Escribe el nuevo nombre...' : 'Ej: Pequeño, Mediano, Grande...'"
                ref="nombreInput"
              />
              <button
                v-if="editando"
                @click="cancelarEdicion"
                type="button"
                class="px-4 py-2.5 text-sm border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors flex items-center gap-1 flex-shrink-0 bg-white"
              >
                <X class="h-3.5 w-3.5" /> Cancelar
              </button>
              <button
                @click="guardar"
                :disabled="guardando"
                class="px-5 py-2.5 text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow transition-all flex items-center gap-1 font-semibold flex-shrink-0 disabled:opacity-75"
              >
                <LoaderCircle v-if="guardando" class="animate-spin h-3.5 w-3.5" />
                <component :is="editando ? Save : Plus" v-else class="h-3.5 w-3.5" />
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Agregar') }}
              </button>
            </div>
            <p v-if="form.error" class="text-red-500 text-xs italic flex items-center gap-1">
              <AlertCircle class="h-3 w-3" /> {{ form.error }}
            </p>
          </div>

          <!-- Lista -->
          <div v-if="cargando" class="flex items-center justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          </div>

          <div v-else-if="tamanios.length === 0" class="text-center py-10 text-gray-400">
            <Ruler class="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm">No se encontraron tamaños</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="t in tamanios"
              :key="t.idtamanio"
              :class="['flex items-center justify-between px-4 py-3 bg-white rounded-2xl border shadow-sm transition-all',
                t.estado === 0 ? 'opacity-60 bg-gray-50 border-dashed' : 'border-gray-100',
                editandoId === t.idtamanio ? 'border-orange-400 ring-2 ring-orange-200' : '']"
            >
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="t.estado === 1 ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400'">
                  <Ruler class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ t.nombre }}</p>
                  <span :class="['text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider',
                    t.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600']">
                    {{ t.estado === 1 ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1.5">
                <button
                  @click="editar(t)"
                  class="w-7 h-7 border border-orange-200 hover:bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center transition-colors"
                  title="Editar"
                >
                  <Pencil class="h-3.5 w-3.5" />
                </button>
                <button
                  @click="confirmarToggle(t)"
                  :class="['w-7 h-7 border rounded-xl flex items-center justify-center transition-colors',
                    t.estado === 1 ? 'border-red-200 hover:bg-red-50 text-red-500' : 'border-green-200 hover:bg-green-50 text-green-500']"
                  :title="t.estado === 1 ? 'Desactivar' : 'Activar'"
                >
                  <component :is="t.estado === 1 ? EyeOff : Eye" class="h-3.5 w-3.5" />
                </button>
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

        <!-- Footer -->
        <div class="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            @click="$emit('cerrar')"
            class="px-6 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-2xl bg-white text-gray-600 font-semibold transition-all flex items-center gap-2"
          >
            <X class="h-4 w-4" /> Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirmación de cambio de estado -->
  <ModalConfirmacion
    :show="modalConfirmacion.visible"
    :mensaje="modalConfirmacion.accion"
    :nombreUsuario="modalConfirmacion.nombre"
    @confirmar="onConfirmarToggle"
    @cancelar="modalConfirmacion.visible = false"
  />

  <!-- Notificación -->
  <Transition name="slide-up">
    <div v-if="notificacion.visible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-[60] font-semibold">
      <CheckCircle class="h-5 w-5" />
      {{ notificacion.mensaje }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { X, Plus, Pencil, Save, LoaderCircle, Search, Eye, EyeOff, CheckCircle, AlertCircle, Ruler } from 'lucide-vue-next';
import { listarTamanios, registrarTamanio, updateTamanio, toggleTamanio } from '@/Server/Tamanio';
import Paginado from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion from '@/views/Components/Modals/ModalConfirmacion.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
});

const emit = defineEmits(['cerrar']);

const tamanios = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const editando = ref(false);
const editandoId = ref(null);

const filtros = reactive({ search: '', estado: '-1', limite: 8 });
const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const form = reactive({ nombre: '', error: '' });
const notificacion = reactive({ visible: false, mensaje: '' });
const modalConfirmacion = reactive({ visible: false, id: null, nombre: '', accion: '' });

const nombreInput = ref(null);
let debounceTimer = null;

const estadoOpciones = [
  { value: '-1', label: 'Todos', color: 'bg-gray-400' },
  { value: '1', label: 'Activos', color: 'bg-green-500' },
  { value: '0', label: 'Inactivos', color: 'bg-red-400' },
];

const inputClass = computed(() =>
  form.error
    ? 'flex-1 px-4 py-2.5 border-0 shadow-sm bg-white rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20 ring-2 ring-red-500/50 transition-all'
    : 'flex-1 px-4 py-2.5 border-0 shadow-sm bg-white rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all'
);

const cargarTamanios = async () => {
  cargando.value = true;
  try {
    const estadoParam = filtros.estado === '-1' ? undefined : filtros.estado;
    const resp = await listarTamanios(filtros.search || undefined, estadoParam, paginacion.paginaActual, filtros.limite);
    tamanios.value = resp.data ?? [];
    paginacion.total = parseInt(resp.total) || 0;
    paginacion.totalPaginas = Math.ceil(paginacion.total / filtros.limite);
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cargar tamaños');
  } finally {
    cargando.value = false;
  }
};

const onSearch = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    paginacion.paginaActual = 1;
    cargarTamanios();
  }, 400);
};

const onEstado = (val) => {
  filtros.estado = val;
  paginacion.paginaActual = 1;
  cargarTamanios();
};

const onCambiarPagina = (page) => {
  paginacion.paginaActual = page;
  cargarTamanios();
};

const cancelarEdicion = () => {
  editando.value = false;
  editandoId.value = null;
  form.nombre = '';
  form.error = '';
};

const editar = (t) => {
  editando.value = true;
  editandoId.value = t.idtamanio;
  form.nombre = t.nombre;
  form.error = '';
  nextTick(() => nombreInput.value?.focus());
};

const guardar = async () => {
  const nombre = form.nombre?.trim();
  if (!nombre) { form.error = 'El nombre es requerido.'; return; }
  if (nombre.length > 100) { form.error = 'Máximo 100 caracteres.'; return; }

  const duplicado = tamanios.value.some(t =>
    t.idtamanio !== editandoId.value && t.nombre.toLowerCase() === nombre.toLowerCase()
  );
  if (duplicado) { form.error = 'Ya existe un tamaño con este nombre.'; return; }

  guardando.value = true;
  form.error = '';
  try {
    const resp = editando.value
      ? await updateTamanio(editandoId.value, nombre)
      : await registrarTamanio(nombre);
    mostrarNotificacion(resp?.message ?? (editando.value ? 'Tamaño actualizado' : 'Tamaño creado'));
    cancelarEdicion();
    await cargarTamanios();
  } catch (err) {
    form.error = err.response?.data?.message ?? 'Error al guardar el tamaño';
  } finally {
    guardando.value = false;
  }
};

const confirmarToggle = (t) => {
  modalConfirmacion.id = t.idtamanio;
  modalConfirmacion.nombre = t.nombre;
  modalConfirmacion.accion = t.estado === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible = true;
};

const onConfirmarToggle = async () => {
  const id = modalConfirmacion.id;
  modalConfirmacion.visible = false;
  if (!id) return;
  try {
    const resp = await toggleTamanio(id);
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarTamanios();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cambiar el estado');
  }
};

const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje;
  notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

watch(() => props.show, (val) => {
  if (val) {
    cancelarEdicion();
    cargarTamanios();
  }
});

onMounted(() => {
  if (props.show) cargarTamanios();
});
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(20px); }
</style>