<template>
  <div class="min-h-screen relative overflow-hidden">
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
                <Database class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Datos de la Empresa
          </h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div v-else-if="dato" class="space-y-6">

        <!-- ── Perfil de empresa ── -->
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <!-- Cover -->
          <div class="h-48 bg-gradient-to-r from-orange-500 via-red-600 to-orange-700 relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <!-- Info principal -->
          <div class="relative px-8 pb-8">
            <div class="flex flex-col md:flex-row md:items-end gap-6 -mt-16">

              <!-- Logo -->
              <div class="relative flex-shrink-0">
                <div class="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                  <img
                    v-if="dato.foto"
                    :src="dato.foto"
                    :alt="dato.nombre"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Building class="h-14 w-14 text-orange-400" />
                  </div>
                </div>
                <!-- Botón cámara -->
                <button
                  @click="abrirModalFoto"
                  class="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  title="Cambiar logo"
                >
                  <Camera class="h-4 w-4" />
                </button>
              </div>

              <!-- Nombre + propietario + botón editar -->
              <div class="flex-1 pb-2">
                <h1 class="text-3xl font-bold text-gray-800 mb-1">{{ dato.nombre }}</h1>
                <p class="text-gray-500 flex items-center gap-1.5">
                  <User class="h-4 w-4 text-orange-500" />
                  Propietario: <span class="font-semibold text-gray-700">{{ nombrePropietario }}</span>
                </p>
              </div>

              <button
                @click="abrirModalEditar"
                class="flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold self-end"
              >
                <Edit class="h-4 w-4" /> Editar Información
              </button>
            </div>

            <!-- Stats rápidos -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
                <Mail class="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div class="text-xs text-blue-600 font-semibold mb-1">Email</div>
                <div class="text-sm font-bold text-gray-800 truncate">{{ dato.email ?? '—' }}</div>
              </div>
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                <Phone class="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div class="text-xs text-green-600 font-semibold mb-1">Celular</div>
                <div class="text-sm font-bold text-gray-800">{{ dato.celular ?? '—' }}</div>
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
                <Building class="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div class="text-xs text-purple-600 font-semibold mb-1">Sucursales</div>
                <div class="text-lg font-bold text-gray-800">{{ sucursales.length }}</div>
              </div>
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 text-center">
                <Shield class="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div class="text-xs text-orange-600 font-semibold mb-1">Estado</div>
                <div class="text-sm font-bold text-green-600">Activo</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Tarjeta propietario ── -->
        <div v-if="dato.persona" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User class="h-5 w-5 text-orange-500" /> Información del Propietario
          </h2>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
              <img v-if="dato.persona.imagen" :src="dato.persona.imagen" alt="foto" class="w-full h-full object-cover" />
              <span v-else class="text-white font-bold text-lg">
                {{ dato.persona.nombre?.charAt(0) }}{{ dato.persona.apellidopaterno?.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-bold text-gray-800">{{ nombrePropietario }}</p>
              <p v-if="dato.persona.email" class="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Mail class="h-3.5 w-3.5" /> {{ dato.persona.email }}
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- Sin datos -->
      <div v-else class="flex items-center justify-center py-20 text-center">
        <div>
          <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Database class="h-10 w-10 text-orange-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-700 mb-2">Sin datos de empresa</h3>
          <p class="text-gray-500">No se encontraron datos de la empresa.</p>
        </div>
      </div>
    </Transition>

    <!-- Toast notificación -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible" class="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>

    <!-- Modal: Cambiar Logo -->
    <AgregarFoto
      :show="modalFoto.visible"
      :nombreEmpresa="dato?.nombre ?? ''"
      :imagenActual="dato?.foto ?? ''"
      :subiendo="modalFoto.subiendo"
      @close="cerrarModalFoto"
      @guardar="onGuardarFoto"
    />

    <!-- Modal: Editar Datos -->
    <EditarDatos
      :show="modalEditar.visible"
      :dato="dato ?? {}"
      :guardando="modalEditar.guardando"
      :propietarios="propietarios"
      :emails="emails"
      :numeros="numeros"
      @close="cerrarModalEditar"
      @guardar="onGuardarDatos"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Database, Building, Camera, Edit, User,
  Mail, Phone, Shield, CheckCircle
} from 'lucide-vue-next';

import { AdmDatos as apiAdmDatos, UpdateAdmDatos, SubirFoto, AddPhoto, listarSucursales } from '@/Server/api';
import { listarUsuarios }                from '@/Server/Usuario';
import { listarEmail, listarNumero }     from '@/Server/Complemento.js';

import AgregarFoto from './AgregarFoto.vue';
import EditarDatos from './EditarDatos.vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const dato            = ref(null);   // objeto único de la empresa
const sucursales      = ref([]);
const propietarios    = ref([]);
const emails          = ref([]);     // [{ email }]
const numeros         = ref([]);     // [{ numero }]

const notificacion = reactive({ visible: false, mensaje: '' });
const modalFoto    = reactive({ visible: false, subiendo: false });
const modalEditar  = reactive({ visible: false, guardando: false });

// ── Computed ──────────────────────────────────────────────────────────────────
const nombrePropietario = computed(() => {
  const p = dato.value?.persona;
  if (!p) return '—';
  return `${p.nombre ?? ''} ${p.apellidopaterno ?? ''}`.trim();
});

// ── Carga inicial en paralelo ─────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [datosRes, sucRes, propRes, emailsRes, numerosRes] = await Promise.all([
      apiAdmDatos(),
      listarSucursales(),
      listarUsuarios(),
      listarEmail(),
      listarNumero(),
    ]);

    // AdmDatos devuelve array — tomamos el primero
    const raw = Array.isArray(datosRes) ? datosRes[0] : datosRes;
    // Normalizar a minúsculas para consistencia
    dato.value = raw ? {
      iddatos:   raw.iddatos   ?? raw.IdDatos,
      nombre:    raw.nombre    ?? raw.Nombre    ?? '',
      foto:      raw.foto      ?? raw.Imagen?.Url ?? '',
      celular:   raw.celular   ?? raw.Celular   ?? '',
      email:     raw.email     ?? raw.Email?.Email ?? '',
      idemail:   raw.idemail   ?? raw.Email?.IdEmail ?? null,
      persona:   raw.persona   ?? (raw.Persona ? {
        idpersona:      raw.Persona.IdPersona,
        nombre:         raw.Persona.Nombre,
        apellidopaterno:raw.Persona.ApellidoPaterno,
        apellidomaterno:raw.Persona.ApellidoMaterno,
        email:          raw.Persona.Email?.Email ?? null,
        imagen:         raw.Persona.Imagen?.Url  ?? null,
      } : null),
    } : null;

    sucursales.value   = sucRes?.data   ?? sucRes   ?? [];
    propietarios.value = propRes?.data  ?? propRes  ?? [];
    emails.value       = emailsRes      ?? [];
    numeros.value      = numerosRes     ?? [];
  } catch (err) {
    console.error('Error al cargar datos:', err);
    mostrarNotificacion('Error al cargar datos de la empresa');
  } finally {
    setTimeout(() => { cargandoInicial.value = false; }, 400);
  }
});

// ── Modal Foto ─────────────────────────────────────────────────────────────────
const abrirModalFoto  = () => { modalFoto.visible = true; };
const cerrarModalFoto = () => { modalFoto.visible = false; };

const onGuardarFoto = async (archivo) => {
  modalFoto.subiendo = true;
  try {
    const url      = await SubirFoto(archivo);
    const response = await AddPhoto({ id: dato.value.iddatos, foto: url });
    dato.value.foto = url;
    mostrarNotificacion(response?.message ?? 'Logo actualizado');
    cerrarModalFoto();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al subir la imagen');
  } finally {
    modalFoto.subiendo = false;
  }
};

// ── Modal Editar ───────────────────────────────────────────────────────────────
const abrirModalEditar  = () => { modalEditar.visible = true; };
const cerrarModalEditar = () => { modalEditar.visible = false; };

const onGuardarDatos = async (data) => {
  modalEditar.guardando = true;
  try {
    const response = await UpdateAdmDatos({
      id:        data.iddatos,
      Nombre:    data.nombre,
      Celular:   data.celular,
      IdEmail:   data.idemail,
      Email:     data.email,
      IdPersona: data.idpersona,
    });

    // Actualizar estado local sin recargar
    dato.value.nombre  = data.nombre;
    dato.value.celular = data.celular;
    dato.value.email   = data.email;
    dato.value.idemail = data.idemail;

    // Si cambió el propietario, buscar la nueva persona en la lista
    if (data.idpersona) {
      const prop = propietarios.value.find(
        u => (u.idpersona ?? u.IdPersona ?? u.persona?.idpersona ?? u.Persona?.IdPersona) === data.idpersona
      );
      if (prop) {
        dato.value.persona = prop.persona ?? prop.Persona ?? prop;
      }
    }

    mostrarNotificacion(response?.message ?? 'Datos actualizados');
    cerrarModalEditar();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar los datos');
  } finally {
    modalEditar.guardando = false;
  }
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
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
