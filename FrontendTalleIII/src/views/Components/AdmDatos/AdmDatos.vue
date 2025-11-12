
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative overflow-hidden p-6">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <div class="w-full">
      <AdmDatosHeader
        v-for="dato in datos"
        :key="dato.IdDatos"
        :dato="dato"
        :sucursales="sucursales"
        @abrir-modal-foto="abrirModalFoto"
        @abrir-modal-edicion-datos="abrirModalEdicionDatos"
      />

      <!-- Sucursales Section -->
      <!-- This section remains in AdmDatos.vue for now, as it's not a modal or a simple header -->

    </div>

    <!-- Modal Subir Foto -->
    <AdmDatosPhotoModal
      :show="modalFoto"
      :datoActual="datoActual"
      :vistaPrevia="vistaPrevia"
      :archivoSeleccionado="archivoSeleccionado"
      :subiendo="subiendo"
      @close="cerrarModalFoto"
      @update:vistaPrevia="vistaPrevia = $event"
      @update:archivoSeleccionado="archivoSeleccionado = $event"
      @subir-foto="subirFoto"
      @eliminar-imagen="eliminarImagen"
    />

    <!-- Modal Editar Datos -->
    <AdmDatosEditModal
      :show="modalEdicionDatos"
      :datoActual="datoActual"
      :errors="errors"
      :propietario="propietario"
      :queryPropietario="queryPropietario"
      :email="email"
      :numero="numero"
      @close="cerrarModalEdicionDatos"
      @update:datoActual="datoActual = $event"
      @update:errors="errors = $event"
      @update:queryPropietario="queryPropietario = $event"
      @guardar-datos="guardarDatos"
      ref="admDatosEditModal"
    />

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

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';

import {
  CheckCircle
} from 'lucide-vue-next';

import AdmDatosHeader from './AdmDatosHeader.vue';
import AdmDatosPhotoModal from './AdmDatosPhotoModal.vue';
import AdmDatosEditModal from './AdmDatosEditModal.vue';

import { AdmDatos, UpdateAdmDatos, SubirFoto, AddPhoto, listarSucursales } from '@/Server/api';
import { listarUsuarios } from '@/Server/Usuario';
import { listarEmail, listarNumero } from '@/Server/Complemento.js';

const toast = useToast();

const modalFoto = ref(false);
const modalEdicionDatos = ref(false);
const subiendo = ref(false);

const vistaPrevia = ref('');
const archivoSeleccionado = ref(null);
const inputArchivo = ref(null);

const queryPropietario = ref('');

const datos = ref(null);
const sucursales = ref([]);
const propietario = ref([]);
const successMessage = ref(null);
const showSuccessToast = ref(false);

const datoActual = ref({
  IdDatos: null,
  Nombre: '',
  Celular: '',
  Imagen :{ IdImagen: null,  Url: ''},
  Email:{ IdEmail: null, Email: ''},
  Persona:{ IdPersona:null, Nombre:'', ApellidoPaterno:'', ApellidoMaterno:''}
});

const errors = reactive({
  nombre: '',
  email: '',
  celular: '',
  propietario: ''
});

const email = ref([]);
const numero = ref([]);

const admDatosEditModal = ref(null);

const propietariosFiltrados = computed(() => {
  const query = queryPropietario.value.toLowerCase().trim();
  return query === ''
    ? propietario.value
    : propietario.value.filter((b) => {
        const nombreCompleto = `${b.Persona.Nombre} ${b.Persona.ApellidoPaterno} ${b.Persona.ApellidoMaterno}`.toLowerCase();
        return nombreCompleto.includes(query);
      });
});

const ListaDatos = async () => {
  try {
    datos.value = await AdmDatos();
    sucursales.value = await listarSucursales();
    propietario.value = await listarUsuarios();
  } catch (error) {
    mostrarError('No se pudieron cargar los datos.');
  }
};

const ListarEmail = async () => {
  try {
    email.value = await listarEmail();
  } catch (error) {
    mostrarError('No se pudieron cargar los emails.');
  }
};

const ListarNumero = async () => {
  try {
    numero.value = await listarNumero();
  } catch (error) {
    mostrarError('No se pudieron cargar los números de celular.');
  }
};

const mostrarError = (message) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 3000,
  });
};

const abrirModalFoto = (dato) => {
  datoActual.value = { ...dato };
  vistaPrevia.value = datoActual.value.Imagen.Url; // Set preview from existing image
  modalFoto.value = true;
};

const cerrarModalFoto = () => {
  modalFoto.value = false;
  vistaPrevia.value = '';
  archivoSeleccionado.value = null;
};

const eliminarImagen = () => {
  vistaPrevia.value = '';
  archivoSeleccionado.value = null;
};

const subirFoto = async () => {
  if (datoActual.value.Imagen.Url === vistaPrevia.value && archivoSeleccionado.value === null) {
    mostrarNotificacion('La imagen ya está asignada.');
    cerrarModalFoto();
    return;
  }

  if (!archivoSeleccionado.value) return;

  subiendo.value = true;
  try {
    const imageUrl = await SubirFoto(archivoSeleccionado.value);
    const response = await AddPhoto({ id: datoActual.value.IdDatos, foto: imageUrl });
    await ListaDatos(); // Reload data to show new image
    mostrarNotificacion(response.message);
  } catch (error) {
    mostrarError('No se pudo subir la imagen. Por favor, inténtalo de nuevo.');
  } finally {
    subiendo.value = false;
    cerrarModalFoto();
  }
};

const abrirModalEdicionDatos = () => {
  if (datos.value && datos.value.length > 0) {
    datoActual.value = JSON.parse(JSON.stringify(datos.value[0]));
    queryPropietario.value = `${datoActual.value.Persona.Nombre} ${datoActual.value.Persona.ApellidoPaterno} ${datoActual.value.Persona.ApellidoMaterno}`.trim();
    modalEdicionDatos.value = true;
  } else {
    mostrarError('No hay datos de empresa para editar.');
  }
};

const cerrarModalEdicionDatos = () => {
  modalEdicionDatos.value = false;
  queryPropietario.value = '';
   Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
};

const guardarDatos = async () => {
  if (admDatosEditModal.value && !admDatosEditModal.value.validateForm()) {
    return;
  }
  try {
    const response = await UpdateAdmDatos({
      id: datoActual.value.IdDatos,
      IdPersona: datoActual.value.Persona.IdPersona,
      Nombre: datoActual.value.Nombre,
      Celular: datoActual.value.Celular,
      IdEmail: datoActual.value.Email.IdEmail,
      Email: datoActual.value.Email.Email
    });
     cerrarModalEdicionDatos();
    mostrarNotificacion(response.message);
    await ListaDatos();
    
  } catch (error) {
    mostrarError('No se pudieron actualizar los datos.');
  }
};

const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

onMounted(async () => {
  await ListaDatos();
  await ListarEmail();
  await ListarNumero();
});
</script>

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

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>
