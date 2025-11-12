<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative overflow-hidden p-6">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <div class="w-full">
      <PerfilHeader :persona="persona" @abrir-modal-foto="abrirModalFoto" />

      <!-- Profile Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InformacionPersonal :persona="persona" />
        <AccionesPerfil @abrir-modal-edicion="abrirModalEdicion" @abrir-modal-contrasena="abrirModalContrasena" />
      </div>
    </div>

    <ModalFoto :show="modalFoto" @cerrar="cerrarModalFoto" @subir="subirFoto" />
    <ModalEdicion 
      :show="modalEdicion" 
      :perfil-data="perfilEditado" 
      :barrios="barrios" 
      :complemento="complemento" 
      :errors="errors"
      @cerrar="cerrarModalEdicion" 
      @guardar="guardarPerfil" 
      @update:perfil-data="handleUpdatePerfil"
      @validate-field="validateField"
    />
    <ModalContrasena 
      :show="modalContrasena" 
      :contrasenas="contrasenas"
      :validar-longitud="validarLongitud"
      :validar-mayuscula="validarMayuscula"
      :validar-numero="validarNumero"
      :validar-coincidencia="validarCoincidencia"
      :contrasena-valida="contrasenaValida"
      @cerrar="cerrarModalContrasena" 
      @cambiar="cambiarContrasena" 
      @update:contrasenas="contrasenas = $event"
    />

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { CheckCircle } from 'lucide-vue-next';
import PerfilHeader from './PerfilHeader.vue';
import InformacionPersonal from './InformacionPersonal.vue';
import AccionesPerfil from './AccionesPerfil.vue';
import ModalFoto from './ModalFoto.vue';
import ModalEdicion from './ModalEdicion.vue';
import ModalContrasena from './ModalContrasena.vue';
import { listarBarrios } from '@/Server/api';
import { listarComplemento } from '@/Server/Complemento';
import { SacarPersona, SubirFoto, AgregarPhoto, RecuperarPassword, UpdatePersona } from '@/Server/Usuario';

// Reactive data
const modalFoto = ref(false);
const modalEdicion = ref(false);
const modalContrasena = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const persona = ref(null);
const barrios = ref([]);
const complemento = ref([]);

const perfilEditado = ref({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  idemail: '',
  email: '',
  celulares: [{ IdCelular: null, Numero: '' }],
  direccion: '',
  fechaDeNacimiento: '',
  barrio: null,
  documento: [{ IdDocumento: null, Documento: '', Complemento: { IdComplemento: 'C-1'},Tipodocumento:{IdTipoDocumento:2} }],
});

const contrasenas = ref({
  actual: '',
  nueva: '',
  confirmar: ''
});

const errors = reactive({
  nombre: '',
  apellidoPaterno: '',
  email: '',
});

// Fetch user profile data
const fetchProfile = async () => {
  try {
      const response = await SacarPersona('USR-1');
      persona.value = response;
  } catch (error) {
    showToastMessage('No se pudo cargar el perfil.');
  }
};

const cargarBarrios = async () => {
  try {
    barrios.value = await listarBarrios();
  } catch (error) {
    showToastMessage('No se pudieron cargar los barrios.');
  }
};

const cargarComplemento = async () => {
  try {
    complemento.value = await listarComplemento();
  } catch (error) {
    showToastMessage('No se pudo cargar los complementos.');
  }
};

onMounted(async () =>{ 
  await fetchProfile();
  await cargarBarrios();
  await cargarComplemento();
});

// Computed
const validarLongitud = computed(() => contrasenas.value.nueva.length >= 8);
const validarMayuscula = computed(() => /[A-Z]/.test(contrasenas.value.nueva));
const validarNumero = computed(() => /\d/.test(contrasenas.value.nueva));
const validarCoincidencia = computed(() =>
  contrasenas.value.nueva === contrasenas.value.confirmar && contrasenas.value.nueva !== ''
);

const contrasenaValida = computed(() =>
  validarLongitud.value && validarMayuscula.value && validarNumero.value && validarCoincidencia.value
);

// Methods
const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada';
  const date = new Date(fecha);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Modal Foto
const abrirModalFoto = () => {
  modalFoto.value = true;
};

const cerrarModalFoto = () => {
  modalFoto.value = false;
};

const subirFoto = async (archivo) => {
  if (!archivo) return;
  try {
    const imageUrl = await SubirFoto(archivo);
    await AgregarPhoto(persona.value.IdPersona, imageUrl);
    await fetchProfile(); // Refresh profile data
    showToastMessage('Foto de perfil actualizada exitosamente');
    cerrarModalFoto();
  } catch (error) {
    showToastMessage('No se pudo subir la imagen.');
  }
};

// Modal Edición  
const abrirModalEdicion = () => {
  perfilEditado.value = {
    nombre: persona.value.Nombre,
    apellidoPaterno: persona.value.ApellidoPaterno,
    apellidoMaterno: persona.value.ApellidoMaterno,
    idemail: persona.value.Email?.IdEmail || '',
    email: persona.value.Email?.Email || '',
    celulares: persona.value.Celulares?.length ? JSON.parse(JSON.stringify(persona.value.Celulares)) : [{ IdCelular: null, Numero: '' }],
    direccion: persona.value.Direccion?.Direccion || '',
    fechaDeNacimiento: persona.value.FechaDeNacimiento ? formatearFecha(persona.value.FechaDeNacimiento) : '',
    barrio: persona.value.Direccion?.Barrio || null,
    documento: persona.value.Documento
    ?.filter(sub => sub?.Tipodocumento?.IdTipoDocumento === "2")
    ?.map(sub => ({ 
      IdDocumento: sub?.IdDocumento || null,
      Documento: sub?.Documento || '',
      Complemento: { IdComplemento: sub?.Complemento?.IdComplemento || null },
      Tipodocumento: { IdTipoDocumento: sub?.Tipodocumento?.IdTipoDocumento || null }
    })) || []
  };
  modalEdicion.value = true;
};

const cerrarModalEdicion = () => {
  modalEdicion.value = false;
};

const guardarPerfil = async () => {
  if (!validateForm()) {
    return;
  }
  try {
    const payload = {
      IdPersona: persona.value.IdPersona,
      Nombre: perfilEditado.value.nombre,
      ApellidoPaterno: perfilEditado.value.apellidoPaterno,
      ApellidoMaterno: perfilEditado.value.apellidoMaterno,
      Celulares: perfilEditado.value.celulares,
      IdEmail: perfilEditado.value.idemail,
      Email: perfilEditado.value.email,
      Direccion: perfilEditado.value.direccion,
      FechaDeNacimiento: perfilEditado.value.fechaDeNacimiento,
      BarrioId: perfilEditado.value.barrio?.IdBarrio,
       Documento:perfilEditado.value.documento?.map(sub => ({
    IdDocumento: sub.IdDocumento,
    Documento: sub.Documento,
     IdTipodocumento:sub.Tipodocumento.IdTipoDocumento,
    Complemento:sub.Complemento?.IdComplemento
  })),
    };
    await UpdatePersona(payload);
    await fetchProfile();
    showToastMessage('Perfil actualizado exitosamente');
    cerrarModalEdicion();
  } catch (error) {
    showToastMessage('No se pudo actualizar el perfil.');
  }
};

const handleUpdatePerfil = (newPerfil) => {
  perfilEditado.value = newPerfil;
};

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value || !value.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      break;
    case 'apellidoPaterno':
      if (!value || !value.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El apellido solo puede contener letras y espacios.';
      break;
    case 'email':
      if (!value) {
        error = 'El correo electrónico es requerido.';
      } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = 'El formato del correo electrónico no es válido.';
      }
      break;
  }
  errors[field] = error;
};

const validateForm = () => {
  validateField('nombre', perfilEditado.value.nombre);
  validateField('apellidoPaterno', perfilEditado.value.apellidoPaterno);
  validateField('email', perfilEditado.value.email);

  return Object.values(errors).every(error => !error);
};

// Modal Contraseña
const abrirModalContrasena = () => {
  contrasenas.value = {
    actual: '',
    nueva: '',
    confirmar: ''
  };
  modalContrasena.value = true;
};

const cerrarModalContrasena = () => {
  modalContrasena.value = false;
};

const cambiarContrasena = async (newContrasenas) => {
  contrasenas.value = newContrasenas;
  if (!contrasenaValida.value) {
    showToastMessage('Por favor, complete todos los requisitos de contraseña');
    return;
  }

  try {
    const payload = {
      email: persona.value.Email.Email,
      password: contrasenas.value.nueva,
      repetirContrasena: contrasenas.value.confirmar,
    };
    await RecuperarPassword(payload);
    showToastMessage('Contraseña cambiada exitosamente');
    cerrarModalContrasena();
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'No se pudo cambiar la contraseña.';
    showToastMessage(errorMessage);
  }
};
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
