<template>
  <div class="min-h-screen relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading -->
    <Transition name="fade" mode="out-in">
      <div v-if="cargando" class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto relative mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <User class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Perfil</h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div v-else-if="persona" class="space-y-6">

        <!-- ── Header perfil ── -->
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <!-- Cover -->
          <div class="h-48 bg-gradient-to-r from-orange-500 via-red-600 to-orange-700 relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <!-- Botón cámara en esquina del cover -->
            <button
              @click="modalFoto.visible = true"
              class="absolute top-5 right-5 bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl shadow-lg hover:bg-white/30 transition-all"
            >
              <Camera class="h-5 w-5" />
            </button>
          </div>

          <div class="relative px-8 pb-8">
            <div class="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                  <img
                    v-if="persona.imagen"
                    :src="persona.imagen"
                    :alt="persona.nombre"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-4xl font-bold text-orange-400">
                      {{ persona.nombre?.charAt(0) }}{{ persona.apellidopaterno?.charAt(0) }}
                    </span>
                  </div>
                </div>
                <button
                  @click="modalFoto.visible = true"
                  class="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white p-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <Camera class="h-4 w-4" />
                </button>
              </div>

              <!-- Nombre y email -->
              <div class="flex-1 pb-2">
                <h1 class="text-3xl font-bold text-gray-800 mb-1">
                  {{ persona.nombre }} {{ persona.apellidopaterno }}
                </h1>
                <p class="text-gray-500 flex items-center gap-1.5">
                  <Mail class="h-4 w-4 text-orange-500" />
                  {{ persona.email || 'Sin email' }}
                </p>
              </div>
            </div>

            <!-- Stats rápidos -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
                <Calendar class="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div class="text-lg font-bold text-gray-800">{{ edad }}</div>
                <div class="text-xs text-blue-600 font-semibold">Años</div>
              </div>
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                <Phone class="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div class="text-lg font-bold text-gray-800">{{ persona.celulares?.length || 0 }}</div>
                <div class="text-xs text-green-600 font-semibold">Teléfonos</div>
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
                <MapPin class="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div class="text-lg font-bold text-gray-800">{{ persona.direccion ? 1 : 0 }}</div>
                <div class="text-xs text-purple-600 font-semibold">Dirección</div>
              </div>
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 text-center">
                <Shield class="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div class="text-sm font-bold text-gray-800 truncate">{{ primerRol }}</div>
                <div class="text-xs text-orange-600 font-semibold">Rol</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Grid: info + acciones ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Información personal (2 cols) -->
          <InformacionPersonal :persona="persona" />

          <!-- Panel de acciones (1 col) -->
          <div class="space-y-4">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings class="h-5 w-5 text-orange-500" /> Acciones
              </h3>
              <div class="space-y-3">
                <button
                  @click="modalEditar.visible = true"
                  class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Edit class="h-4 w-4" /> Editar Perfil
                </button>
                <button
                  @click="modalContrasena.visible = true"
                  class="w-full border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Lock class="h-4 w-4" /> Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin datos -->
      <div v-else class="flex items-center justify-center min-h-screen text-center">
        <div>
          <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <User class="h-10 w-10 text-orange-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-700">No se encontraron datos del perfil</h3>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible" class="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>

    <!-- Modal Foto -->
    <ModalFoto
      :show="modalFoto.visible"
      :imagenActual="persona?.imagen ?? ''"
      :subiendo="modalFoto.subiendo"
      @cerrar="modalFoto.visible = false"
      @subir="onSubirFoto"
    />

    <!-- Modal Editar Perfil -->
    <EditarPerfil
      :show="modalEditar.visible"
      :persona="persona ?? {}"
      :guardando="modalEditar.guardando"
      :barrios="barrios"
      :complementos="complementos"
      :emailsOcupados="emails"
      :numerosOcupados="numeros"
      :documentosOcupados="documentos"
      @cerrar="modalEditar.visible = false"
      @guardar="onGuardarPerfil"
    />

    <!-- Modal Contraseña -->
    <EditarContrasenia
      :show="modalContrasena.visible"
      :email="persona?.email ?? ''"
      :guardando="modalContrasena.guardando"
      @cerrar="modalContrasena.visible = false"
      @cambiar="onCambiarContrasena"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  User, Camera, Mail, Calendar, Phone, MapPin,
  Shield, Edit, Lock, Settings, CheckCircle
} from 'lucide-vue-next';

import {
  SacarPersona, SubirFoto, AgregarPhoto,
  RecuperarPassword, UpdatePersona
} from '@/Server/Usuario';
import { listarBarrios }                            from '@/Server/api';
import { listarComplemento, listarEmail, listarNumero, listarDocumento } from '@/Server/Complemento';

import ModalFoto          from './ModalFoto.vue';
import EditarPerfil       from './EditarPerfil.vue';
import EditarContrasenia  from './EditarContrasenia.vue';
import InformacionPersonal from './InformacionPersonal.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargando  = ref(true);
const persona   = ref(null);
const barrios   = ref([]);
const complementos = ref([]);
const emails    = ref([]);
const numeros   = ref([]);
const documentos= ref([]);

const notificacion    = reactive({ visible: false, mensaje: '' });
const modalFoto       = reactive({ visible: false, subiendo: false });
const modalEditar     = reactive({ visible: false, guardando: false });
const modalContrasena = reactive({ visible: false, guardando: false });

// ── Computed ──────────────────────────────────────────────────────────────────
const edad = computed(() => {
  if (!persona.value?.fechadenacimiento) return 0;
  const hoy = new Date(), nac = new Date(persona.value.fechadenacimiento);
  let e = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
  return e;
});

const primerRol = computed(() =>
  persona.value?.usuario?.roles?.[0]?.nombre ?? '—'
);

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) throw new Error('No hay usuario autenticado');
    const { IdUsuario } = JSON.parse(usuarioStr);

    const [personaData, barriosData, compData, docsData, emailsData, numData] = await Promise.all([
      SacarPersona(IdUsuario),
      listarBarrios(),
      listarComplemento(),
      listarDocumento(),
      listarEmail(),
      listarNumero(),
    ]);

    persona.value    = personaData;
    barrios.value    = barriosData      ?? [];
    complementos.value = compData       ?? [];
    documentos.value = docsData         ?? [];
    emails.value     = emailsData       ?? [];
    numeros.value    = numData          ?? [];
  } catch (err) {
    console.error('Error al cargar perfil:', err);
    mostrarNotificacion('Error al cargar el perfil');
  } finally {
    cargando.value = false;
  }
});

// ── Foto ──────────────────────────────────────────────────────────────────────
const onSubirFoto = async (archivo) => {
  modalFoto.subiendo = true;
  try {
    const url = await SubirFoto(archivo);
    await AgregarPhoto(persona.value.idpersona, url);
    persona.value.imagen = url;
    mostrarNotificacion('Foto actualizada exitosamente');
    modalFoto.visible = false;
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al subir la foto');
  } finally {
    modalFoto.subiendo = false;
  }
};

// ── Editar perfil ─────────────────────────────────────────────────────────────
const onGuardarPerfil = async (payload) => {
  modalEditar.guardando = true;
  try {
  
    await UpdatePersona(payload);
    // Refrescar persona desde el servidor
    const usuarioStr = localStorage.getItem('usuario');
    const { IdUsuario } = JSON.parse(usuarioStr);
    persona.value = await SacarPersona(IdUsuario);
    mostrarNotificacion('Perfil actualizado exitosamente');
    modalEditar.visible = false;
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al actualizar el perfil');
  } finally {
    modalEditar.guardando = false;
  }
};

// ── Contraseña ────────────────────────────────────────────────────────────────
const onCambiarContrasena = async (payload) => {
  modalContrasena.guardando = true;
  try {
    await RecuperarPassword(payload);
    mostrarNotificacion('Contraseña cambiada exitosamente');
    modalContrasena.visible = false;
  } catch (err) {
    console.error(err);
    mostrarNotificacion(err.response?.data?.message ?? 'Error al cambiar la contraseña');
  } finally {
    modalContrasena.guardando = false;
  }
};

// ── Utilidades ────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
