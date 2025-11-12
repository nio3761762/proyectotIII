<template>
  <div class="min-h-screen  p-6 space-y-8">
    <!-- bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 -->
    <!-- VISTA PRINCIPAL: LISTA DE PRESENTACIONES -->
    <div>
      <PresentacionHeader @new-presentation="iniciarModoEdicion" />

      <PresentacionFilters v-model="filtros.nombre" />

      <PresentacionList
        :presentaciones="presentacionesPaginadas"
        @edit="iniciarModoEdicion"
        @toggle-status="abrirModalConfirmacion"
      />

      <PresentacionPagination
        v-if="totalPaginas > 0"
        :totalPaginas="totalPaginas"
        :paginaActual="paginaActual"
        :paginacionInfo="paginacionInfo"
        :visiblePages="visiblePages"
        @update:paginaActual="paginaActual = $event"
      />
    </div>

    <PresentacionFormModal
      :show="showModal"
      :esNuevaPresentacion="esNuevaPresentacion"
      :presentacion="presentacionEditada"
      :errors="errors"
      @update:presentacion="presentacionEditada = $event"
      @close="cancelarModoEdicion"
      @save="guardarPresentacion"
    />

    <!-- MODAL DE CONFIRMACIÓN -->
    <ConfirmacionModal
      :show="modalAct"
      :title="presentacionParaAccion?.estadoActual === 1 ? '¿Desactivar Presentación?' : '¿Activar Presentación?'"
      :confirmText="`Sí, ${mensajeModal}`"
      cancelText="Cancelar"
      :confirmButtonClass="presentacionParaAccion?.estadoActual === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ mensajeModal.toLowerCase() }} la presentación
      <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
        {{ presentacionParaAccion?.nombre }}
      </span>?
    </ConfirmacionModal>
    
    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { AlertTriangle, CheckCircle } from 'lucide-vue-next'; // Only import what's needed here

import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import PresentacionHeader from './PresentacionHeader.vue';
import PresentacionFilters from './PresentacionFilters.vue';
import PresentacionList from './PresentacionList.vue';
import PresentacionPagination from './PresentacionPagination.vue';
import PresentacionFormModal from './PresentacionFormModal.vue';

import { listarPresentaciones, registrarPresentacion, updatePresentacion, deletePresentacion } from '@/Server/Presentacion';
import { useAlertStore } from '@/stores/alertStore';

// --- State ---
const presentaciones = ref([]);
const alertStore = useAlertStore();
const showModal = ref(false);
const esNuevaPresentacion = ref(true);
const modalAct = ref(false);
const showSuccessToast = ref(false);
const successMessage = ref('');
const filtros = ref({
  nombre: "",
});

const paginaActual = ref(1);
const itemsPerPage = 6;

const presentacionEditada = ref({
  IdPresentacion: null,
  Nombre: "",
});

const presentacionParaAccion = ref(null);
const mensajeModal = ref("");

// Validation errors
const errors = reactive({
  nombre: '',
});

const validateField = (field, value, allPresentaciones = [], isEditing = false, currentPresentacionId = null) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allPresentaciones.some(pres => {
          // Exclude current presentation if editing
          if (isEditing && pres.IdPresentacion === currentPresentacionId) {
            return false;
          }
          return pres.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe una presentación con este nombre.';
      }
      break;
    default:
      break;
  }
  return error;
};

const validateForm = () => {
  errors.nombre = validateField('nombre', presentacionEditada.value.Nombre, presentaciones.value, !esNuevaPresentacion.value, presentacionEditada.value.IdPresentacion);
  return Object.values(errors).every(error => !error);
};

const nombreError = computed(() => {
  return validateField('nombre', presentacionEditada.value.Nombre, presentaciones.value, !esNuevaPresentacion.value, presentacionEditada.value.IdPresentacion);
});

watch(nombreError, (newError) => {
  errors.nombre = newError;
});

// --- Computed properties ---
const presentacionesFiltradas = computed(() => {
  let filtradas = presentaciones.value;
  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    filtradas = filtradas.filter(p => p.Nombre.toLowerCase().includes(nombreLower));
  }
  return filtradas;
});

const totalPaginas = computed(() => {
  return Math.ceil(presentacionesFiltradas.value.length / itemsPerPage)
});

const presentacionesPaginadas = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return presentacionesFiltradas.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = presentacionesFiltradas.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} presentaciones`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

// --- Methods ---
const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 1000);
};

const ListarPresentaciones = async () => {
  try {
    const response = await listarPresentaciones();
    presentaciones.value = response;
  } catch (error) {
    console.error('Error al cargar presentaciones:', error);
  }
};

const guardarPresentacion = async () => {
  if (!validateForm()) {
    return;
  }
  try {
    let response = '';
    if (esNuevaPresentacion.value) {
      response = await registrarPresentacion(presentacionEditada.value);
    } else {
      response = await updatePresentacion(presentacionEditada.value);
    }
    cancelarModoEdicion();
    await ListarPresentaciones();
    mostrarNotificacion(response.message);
    alertStore.fetchAlerts();
  } catch (error) {
    console.error('Error al guardar la presentación:', error);
  }
}

const confirmar = async () => {
  if (presentacionParaAccion.value) {
    try {
      const response = await deletePresentacion(presentacionParaAccion.value.id);
      mostrarNotificacion(response.message);
      await ListarPresentaciones();
    } catch (error) {
      console.error('Error al cambiar el estado de la presentación:', error);
    }
  }
  cerrarModalConfirmacion();
}

const iniciarModoEdicion = (presentacion = null) => {
  if (presentacion) {
    esNuevaPresentacion.value = false;
    presentacionEditada.value = JSON.parse(JSON.stringify(presentacion));
  } else {
    esNuevaPresentacion.value = true;
    resetPresentacionEditada();
  }
  showModal.value = true;
  // Clear errors when opening the modal
  Object.keys(errors).forEach(key => errors[key] = '');
}

const cancelarModoEdicion = () => {
  showModal.value = false;
  resetPresentacionEditada();
  // Clear errors when closing the modal
  Object.keys(errors).forEach(key => errors[key] = '');
}

const resetPresentacionEditada = () => {
  presentacionEditada.value = {
    IdPresentacion: null,
    Nombre: "",
  }
}

const abrirModalConfirmacion = (id, nombre, estadoActual) => {
  presentacionParaAccion.value = { id, nombre, estadoActual };
  mensajeModal.value = estadoActual === 1 ? "Desactivar" : "Activar";
  modalAct.value = true;
}

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  presentacionParaAccion.value = null;
}

// --- Lifecycle Hook ---
onMounted(async () => {
  await ListarPresentaciones();
});
</script>